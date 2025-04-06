import sys
import os
import argparse
from pathlib import Path
import time
import json
import torch
import whisper
import datetime
import numpy as np
import ffmpeg
import tempfile
import shutil
import warnings
import threading

# 忽略FP16警告
warnings.filterwarnings("ignore", message="FP16 is not supported on CPU; using FP32 instead")

# 导入字幕格式化模块
from subtitle_formatter import write_subtitle
# 导入模型配置
from model_config import get_model_name

def format_duration(seconds):
    """格式化秒数为分钟:秒格式"""
    minutes = int(seconds // 60)
    remaining_seconds = int(seconds % 60)
    return f"{minutes}:{remaining_seconds:02d}"

class ProgressListener:
    def __init__(self, total_duration):
        self.total_duration = total_duration
        self.last_progress = 0
        self.start_time = time.time()
        
        # 预估总处理时间 (根据视频时长估算)
        self.estimated_total_time = max(60, total_duration * 0.1)  # 最少60秒，或视频长度的10%
        
        # 启动一个模拟进度更新线程
        self._start_progress_simulation()
    
    def _start_progress_simulation(self):
        """启动一个后台线程来更新模拟进度"""
        self.should_stop = False
        
        def update_progress():
            # 进度阶段: 0-20% 准备阶段, 20-90% 转录阶段, 90-100% 完成阶段
            while not self.should_stop and self.last_progress < 95:  # 修改为95%，给完成阶段留出空间
                elapsed = time.time() - self.start_time
                # 计算模拟进度
                if elapsed < self.estimated_total_time * 0.2:
                    # 准备阶段 (0-20%)
                    progress = int(min(20, elapsed / (self.estimated_total_time * 0.2) * 20))
                else:
                    # 转录阶段 (20-95%)
                    remaining_ratio = min(1.0, (elapsed - self.estimated_total_time * 0.2) / 
                                         (self.estimated_total_time * 0.8))
                    progress = int(20 + remaining_ratio * 75)  # 调整为75以到达95%
                
                # 更新进度
                if progress > self.last_progress:
                    self.last_progress = progress
                    print(f"PROGRESS:{progress}")
                    sys.stdout.flush()
                
                # 每1.5秒更新一次
                time.sleep(1.5)
        
        self.progress_thread = threading.Thread(target=update_progress)
        self.progress_thread.daemon = True
        self.progress_thread.start()
    
    def __call__(self, progress_dict):
        """仍保留原回调方法，以便在实际进度可用时使用"""
        if progress_dict.get("task") == "transcribe":
            current_time = progress_dict.get("time", 0)
            if current_time > 0:
                # 如果有实际进度，使用实际进度
                progress = min(int((current_time / self.total_duration) * 75) + 20, 95)  # 调整为75以到达95%
                if progress > self.last_progress:
                    self.last_progress = progress
                    print(f"PROGRESS:{progress}")
                    sys.stdout.flush()
    
    def complete(self):
        """完成处理时调用"""
        self.should_stop = True
        # 添加中间进度以确保平滑过渡到100%
        if self.last_progress < 97:
            self.last_progress = 97
            print("PROGRESS:97")
            sys.stdout.flush()
            time.sleep(0.5)
            
        if self.last_progress < 99:
            self.last_progress = 99
            print("PROGRESS:99")
            sys.stdout.flush()
            time.sleep(0.5)
            
        self.last_progress = 100
        print("PROGRESS:100")
        sys.stdout.flush()


def generate_subtitle(video_path, target_language, format, model_name=None, precision=None, is_audio=False):
    """
    使用whisper生成字幕
    
    参数:
        video_path (str): 视频或音频文件路径
        target_language (str): 目标语言 (zh-CN, zh-TW, en)
        format (str): 字幕格式 (srt/ssa/vtt)
        model_name (str, 可选): 要使用的模型名称，默认使用配置中的默认模型
        precision (str, 可选): 模型精度选项 (high/medium/low)
        is_audio (bool, 可选): 是否为音频文件，默认为False
    返回:
        str: 生成的字幕文件路径
    """
    video_file = Path(video_path)
    output_file = video_file.with_suffix(f'.{format.lower()}')
    temp_dir = None
    audio_path = None
    
    try:
        # 检查CUDA是否可用
        device = "cuda" if torch.cuda.is_available() else "cpu"
        
        # 获取要使用的模型名称，根据精度或明确的模型名称选择
        selected_model = get_model_name(model_name, precision)
        
        # 加载whisper模型 (可选: tiny, base, small, medium, large)
        print(f"正在加载模型 '{selected_model}'... 使用设备: {device}")
        sys.stdout.flush()  # 确保立即刷新输出
        model = whisper.load_model(selected_model, device=device)
      
        # 如果是音频文件，则跳过提取音频步骤
        if is_audio:
            print(f"处理音频文件，跳过音频提取步骤...")
            sys.stdout.flush()
            audio_path = video_path
            # 获取音频时长
            duration = get_audio_duration(audio_path)
        else:
            # 从视频中提取音频
            print(f"正在从视频中提取音频...")
            sys.stdout.flush()
            audio_path, temp_dir = extract_audio(video_path)
            # 获取视频时长
            duration = get_video_duration(video_path)
            
        print(f"媒体时长: {format_duration(duration)}")
        sys.stdout.flush()
        
        # 处理语言代码
        language_code = target_language.lower()  # 转为小写
        if '-' in language_code:
            language_code = language_code.split('-')[0]
        elif '_' in language_code:
            language_code = language_code.split('_')[0]
            
        print(f"开始转录音频... 目标语言: {language_code}")
        sys.stdout.flush()
    
        # 使用简化的转录选项，避免使用不支持的参数
        transcribe_options = {
            "task": "transcribe",
            "language": language_code,
            "verbose": True
        }
        
        # 创建进度监听器
        progress_listener = ProgressListener(duration)
        
        # 开始转录，这里添加进度回调
        result = model.transcribe(audio_path, **transcribe_options)
        
        # 使用字幕格式化模块生成字幕文件
        print(f"正在生成{format}字幕文件...")
        sys.stdout.flush()
        output_file = write_subtitle(result, output_file, format)
        
        # 明确调用complete方法，确保进度到达100%
        progress_listener.complete()
        
        # 通知前端处理完成
        print(f"COMPLETE:{output_file}")
        sys.stdout.flush()
        
        return str(output_file)
    
    except Exception as e:
        print(f"ERROR:{str(e)}", file=sys.stderr)
        sys.stderr.flush()
        return None
    
    finally:
        # 清理临时文件
        if temp_dir and os.path.exists(temp_dir):
            shutil.rmtree(temp_dir)

def extract_audio(video_path):
    """
    从视频文件中提取音频
    返回音频文件的临时路径
    """
    print("开始提取音频...")
    
    # 创建临时文件
    temp_dir = tempfile.mkdtemp()
    audio_path = os.path.join(temp_dir, "audio.wav")
    
    try:
        # 使用ffmpeg提取音频
        (
            ffmpeg
            .input(video_path)
            .output(audio_path, acodec='pcm_s16le', ac=1, ar='16k')
            .run(quiet=True, overwrite_output=True)
        )
        print("音频提取完成")
        return audio_path, temp_dir
    except ffmpeg.Error as e:
        print(f"提取音频时出错: {e.stderr.decode()}")
        shutil.rmtree(temp_dir)
        raise


def get_video_duration(video_path):
    """
    获取视频文件的总时长（秒）
    """
    try:
        probe = ffmpeg.probe(video_path)
        duration = float(probe['format']['duration'])
        return duration
    except ffmpeg.Error as e:
        print(f"获取视频时长时出错: {e.stderr.decode()}")
        return 0

def get_audio_duration(audio_path):
    """
    获取音频文件的总时长（秒）
    """
    try:
        probe = ffmpeg.probe(audio_path)
        duration = float(probe['format']['duration'])
        return duration
    except ffmpeg.Error as e:
        print(f"获取音频时长时出错: {e.stderr.decode()}")
        return 0

def format_timestamp(seconds, always_include_hours=False):
    """
    将秒数格式化为时间戳字符串 (HH:MM:SS.mmm)
    """
    milliseconds = int(seconds * 1000) % 1000
    seconds = int(seconds)
    minutes = seconds // 60
    seconds = seconds % 60
    hours = minutes // 60
    minutes = minutes % 60
    
    if always_include_hours or hours > 0:
        return f"{hours:02d}:{minutes:02d}:{seconds:02d}.{milliseconds:03d}"
    else:
        return f"{minutes:02d}:{seconds:02d}.{milliseconds:03d}"
    

def parse_args():
    parser = argparse.ArgumentParser(description='生成视频字幕')
    parser.add_argument('video_path', type=str, help='视频文件路径')
    parser.add_argument('target_language', type=str, help='目标语言')
    parser.add_argument('format', type=str, help='字幕格式(srt/ssa/vtt)')
    parser.add_argument('--model', type=str, help='使用的模型(tiny/base/small/medium/large)', default=None)
    parser.add_argument('--precision', type=str, help='模型精度(high/medium/low)', default=None)
    parser.add_argument('--audio', action='store_true', help='处理音频文件而不是视频文件')
    return parser.parse_args()

def main():
    args = parse_args()
    video_path = args.video_path
    target_language = args.target_language
    output_format = args.format
    is_audio = args.audio  # 检查是否为音频文件
    precision = args.precision  # 获取精度参数

    print(f"处理{'音频' if is_audio else '视频'}文件: {video_path}")
    sys.stdout.flush()

    # 调用generate_subtitle，捕获返回值
    output_file = generate_subtitle(video_path, target_language, output_format, args.model, precision, is_audio)
    
    # 再次确保发送完成信号
    if output_file:
        print(f"COMPLETE:{output_file}")
        sys.stdout.flush()
        print(f"字幕生成完成: {output_file}")
        sys.stdout.flush()

if __name__ == "__main__":
    main()
