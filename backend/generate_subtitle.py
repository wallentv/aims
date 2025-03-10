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

# 忽略FP16警告
warnings.filterwarnings("ignore", message="FP16 is not supported on CPU; using FP32 instead")

# 导入字幕格式化模块
from subtitle_formatter import write_subtitle

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
    
    def __call__(self, progress_dict):
        if progress_dict.get("task") == "transcribe":
            # 计算已完成的转录时长占总时长的百分比
            current_time = progress_dict.get("time", 0)
            progress = min(int((current_time / self.total_duration) * 70) + 20, 90)
            
            # 只有当进度变化超过1%时才报告，避免频繁输出
            if progress > self.last_progress:
                self.last_progress = progress
                print(f"PROGRESS:{progress}")
                sys.stdout.flush()


def generate_subtitle(video_path, target_language, format):
    """
    使用whisper生成字幕
    
    参数:
        video_path (str): 视频文件路径
        target_language (str): 目标语言 (zh-CN, zh-TW, en)
        format (str): 字幕格式 (srt/ssa/vtt)
    返回:
        str: 生成的字幕文件路径
    """
    video_file = Path(video_path)
    output_file = video_file.with_suffix(f'.{format.lower()}')
    temp_dir = None
    
    try:
        # 检查CUDA是否可用
        device = "cuda" if torch.cuda.is_available() else "cpu"
        print(f"PROGRESS:0")
        sys.stdout.flush()  # 确保立即刷新输出
        
        # 加载whisper模型 (可选: tiny, base, small, medium, large)
        print(f"正在加载模型... 使用设备: {device}")  # 增加设备信息
        sys.stdout.flush()  # 确保立即刷新输出
        model = whisper.load_model("medium", device=device)
        print(f"PROGRESS:10")
        sys.stdout.flush()  # 确保立即刷新输出
        
        # 从视频中提取音频
        print(f"正在从视频中提取音频...")  # 添加明确的状态信息
        sys.stdout.flush()  # 确保立即刷新输出
        audio_path, temp_dir = extract_audio(video_path)
        print(f"PROGRESS:20")
        sys.stdout.flush()  # 确保立即刷新输出

        # 获取视频时长
        duration = get_video_duration(video_path)
        print(f"视频时长: {format_duration(duration)}")  # 添加视频时长信息
        sys.stdout.flush()  # 确保立即刷新输出
        
        # 处理语言代码
        language_code = target_language.lower()  # 转为小写
        if '-' in language_code:
            language_code = language_code.split('-')[0]
        elif '_' in language_code:
            language_code = language_code.split('_')[0]
            
        print(f"开始转录音频... 目标语言: {language_code}")  # 增加语言信息
        sys.stdout.flush()  # 确保立即刷新输出
        print(f"PROGRESS:30")
        sys.stdout.flush()  # 确保立即刷新输出
        
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
        
        # 确保进度到达90%
        print(f"PROGRESS:90")
        sys.stdout.flush()  # 确保立即刷新输出
        
        # 使用字幕格式化模块生成字幕文件
        print(f"正在生成{format}字幕文件...")
        sys.stdout.flush()  # 确保立即刷新输出
        output_file = write_subtitle(result, output_file, format)
        
        print(f"PROGRESS:100")
        sys.stdout.flush()  # 确保立即刷新输出
        
        # 通知前端处理完成
        print(f"COMPLETE:{output_file}")
        sys.stdout.flush()  # 确保立即刷新输出
        
        return str(output_file)
    
    except Exception as e:
        print(f"ERROR:{str(e)}", file=sys.stderr)
        sys.stderr.flush()  # 确保立即刷新错误输出
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
    return parser.parse_args()

def main():
    args = parse_args()
    generate_subtitle(args.video_path, args.target_language, args.format)

if __name__ == "__main__":
    main()
