"""
字幕格式化模块 - 处理不同格式字幕的转换与输出
支持格式: SRT, SSA/ASS, VTT
"""

def format_timestamp(seconds, always_include_hours=False):
    """
    将秒数格式化为 SRT 时间戳格式 (HH:MM:SS,mmm)
    """
    assert seconds >= 0, "非负时间值"
    milliseconds = round(seconds * 1000)
    
    hours = milliseconds // 3_600_000
    milliseconds -= hours * 3_600_000
    
    minutes = milliseconds // 60_000
    milliseconds -= minutes * 60_000
    
    seconds = milliseconds // 1_000
    milliseconds -= seconds * 1_000
    
    if always_include_hours or hours > 0:
        return f"{hours:02d}:{minutes:02d}:{seconds:02d},{milliseconds:03d}"
    else:
        return f"{minutes:02d}:{seconds:02d},{milliseconds:03d}"

def format_ssa_timestamp(seconds):
    """
    将秒数格式化为 SSA 时间戳格式 (H:MM:SS.cs)
    """
    assert seconds >= 0, "非负时间值"
    centiseconds = round(seconds * 100)
    
    hours = centiseconds // 360_000
    centiseconds -= hours * 360_000
    
    minutes = centiseconds // 6_000
    centiseconds -= minutes * 6_000
    
    seconds = centiseconds // 100
    centiseconds -= seconds * 100
    
    return f"{hours}:{minutes:02d}:{seconds:02d}.{centiseconds:02d}"

def write_srt(transcript, file_path):
    """
    将转录结果写入SRT文件
    """
    with open(file_path, "w", encoding="utf-8") as f:
        for i, segment in enumerate(transcript["segments"], start=1):
            print(f"{i}", file=f)
            print(
                f"{format_timestamp(segment['start'], always_include_hours=True)} --> "
                f"{format_timestamp(segment['end'], always_include_hours=True)}",
                file=f
            )
            print(f"{segment['text'].strip()}", file=f)
            print("", file=f)

def write_ssa(transcript, file_path):
    """
    将转录结果写入SSA/ASS文件
    """
    with open(file_path, "w", encoding="utf-8") as f:
        # 写入SSA文件头
        print("[Script Info]", file=f)
        print("Title: Auto Generated Subtitle", file=f)
        print("ScriptType: v4.00+", file=f)
        print("Collisions: Normal", file=f)
        print("PlayResX: 1280", file=f)
        print("PlayResY: 720", file=f)
        print("Timer: 100.0000", file=f)
        print("", file=f)
        
        # 写入样式
        print("[V4+ Styles]", file=f)
        print("Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding", file=f)
        print("Style: Default,Arial,20,&H00FFFFFF,&H000000FF,&H00000000,&H00000000,0,0,0,0,100,100,0,0,1,2,2,2,10,10,10,1", file=f)
        print("", file=f)
        
        # 写入事件
        print("[Events]", file=f)
        print("Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text", file=f)
        
        for i, segment in enumerate(transcript["segments"], start=1):
            start = format_ssa_timestamp(segment["start"])
            end = format_ssa_timestamp(segment["end"])
            text = segment["text"].strip().replace(",", "\\N")  # 使用\N表示换行
            print(f"Dialogue: 0,{start},{end},Default,,0,0,0,,{text}", file=f)

def write_vtt(transcript, file_path):
    """
    将转录结果写入VTT文件
    """
    with open(file_path, "w", encoding="utf-8") as f:
        print("WEBVTT\n", file=f)
        for segment in transcript["segments"]:
            start = format_timestamp(segment["start"]).replace(',', '.')
            end = format_timestamp(segment["end"]).replace(',', '.')
            print(f"{start} --> {end}", file=f)
            print(f"{segment['text'].strip()}\n", file=f)

def write_subtitle(transcript, file_path, format):
    """
    根据指定格式将转录结果写入字幕文件
    
    参数:
        transcript: 转录结果字典
        file_path: 输出文件路径
        format: 字幕格式 (srt, ssa, vtt)
    
    返回:
        str: 生成的文件路径
    """
    from pathlib import Path
    
    # 确保扩展名与格式匹配
    path = Path(file_path)
    if path.suffix.lower()[1:] != format.lower():
        file_path = str(path.with_suffix(f'.{format.lower()}'))
    
    # 根据格式选择相应的写入函数
    if format.lower() == 'srt':
        write_srt(transcript, file_path)
    elif format.lower() == 'ssa':
        write_ssa(transcript, file_path)
    elif format.lower() == 'vtt':
        write_vtt(transcript, file_path)
    else:
        # 默认使用SRT
        file_path = str(path.with_suffix('.srt'))
        write_srt(transcript, file_path)
    
    return file_path