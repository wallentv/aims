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
    "turbo",    # Turbo模型，速度和精度的折中
    "large-v2", # 大型模型的第二版，提供更好的性能
    "large-v3"  # 大型模型的第三版，进一步提升性能
]

# 默认模型设置
DEFAULT_MODEL = "large-v3"

# 精度级别映射到模型
PRECISION_MODEL_MAP = {
    "high": "large-v3",    # 高精度使用最新的大型模型
    "medium": "medium",    # 中等精度使用中型模型
    "low": "small"         # 低精度使用小型模型，速度更快
}

def get_model_name(model_name=None, precision=None):
    """
    获取有效的模型名称
    如果提供了精度参数，则根据精度选择模型
    如果提供了明确的模型名称，则优先使用模型名称
    如果两者都未提供或无效，则返回默认模型
    
    参数:
        model_name (str, 可选): 请求的模型名称
        precision (str, 可选): 精度级别 (high/medium/low)
    
    返回:
        str: 有效的模型名称
    """
    # 如果有明确指定的模型名称且在可用列表中，则使用它
    if model_name and model_name in AVAILABLE_MODELS:
        return model_name
        
    # 如果有精度参数，则根据精度选择模型
    if precision and precision in PRECISION_MODEL_MAP:
        return PRECISION_MODEL_MAP[precision]
    
    # 都没有或无效，则返回默认模型
    return DEFAULT_MODEL
