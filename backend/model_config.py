"""
Whisper模型配置
定义可用的模型选项和默认设置
"""

# 可用的模型选项
AVAILABLE_MODELS = [
    "tiny",     # 最小模型，速度最快，精度较低
    "base",     # 基础模型，速度和精度平衡
    "small",    # 小型模型，精度较好
    "medium",   # 中型模型，较高精度
    "large",    # 大型模型，最高精度，速度最慢
]

# 默认模型设置
DEFAULT_MODEL = "medium"

def get_model_name(model_name=None):
    """
    获取有效的模型名称
    如果提供的模型名称无效，则返回默认模型
    
    参数:
        model_name (str, 可选): 请求的模型名称
    
    返回:
        str: 有效的模型名称
    """
    if model_name and model_name in AVAILABLE_MODELS:
        return model_name
    return DEFAULT_MODEL
