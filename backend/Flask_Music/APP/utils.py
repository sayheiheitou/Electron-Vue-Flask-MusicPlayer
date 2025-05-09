import jwt
import datetime
from flask import current_app
from functools import wraps
from flask import request
import bcrypt


def generate_tokens(user_id):
    """生成访问令牌和刷新令牌"""
    # 1. 获取并验证密钥
    secret_key = current_app.config['JWT_SECRET_KEY']
    if not secret_key:
        print("Missing SECRET_KEY in config")
    if not isinstance(secret_key, (str, bytes)):
        print("SECRET_KEY must be string or bytes")
    payload = {
                  'user_id': user_id,
                  'exp': datetime.datetime.utcnow() + datetime.timedelta(
                      seconds=current_app.config['JWT_ACCESS_TOKEN_EXPIRES']),
                  'type': 'access'
              }
    access_token = jwt.encode(
        payload=payload,
        key=secret_key,
        algorithm='HS256'
    )
    refresh_token = jwt.encode(
        {
            'user_id': user_id,
            'exp': datetime.datetime.utcnow() + datetime.timedelta(
                seconds=current_app.config['JWT_REFRESH_TOKEN_EXPIRES']),
            'type': 'refresh'
        },
        key=secret_key,
        algorithm='HS256'
    )
    print('token generate success')
    return {
        'access_token': access_token,
        'refresh_token': refresh_token
    }


# 验证令牌
def verify_token(token):
    """验证JWT令牌"""
    try:
        payload = jwt.decode(
            token,
            current_app.config['JWT_SECRET_KEY'],
            algorithms=['HS256'],
            options={'verify_exp': True}  # 确保启用exp验证
        )
        return payload
    except jwt.ExpiredSignatureError:
        return {'error': 'Token expired'}
    except jwt.InvalidTokenError:
        return {'error': 'Invalid token'}


def token_required(f):
    """保护路由的装饰器"""

    @wraps(f)
    def decorated(*args, **kwargs):
        token = None

        # 从Authorization头获取token
        if 'Authorization' in request.headers:
            token = request.headers['Authorization'].split(' ')[1]

        if not token:
            return {'message': 'Token is missing'}, 401
        payload = verify_token(token)
        print(payload)
        if 'error' in payload:
            return {'message': payload['error']}, 401

        if payload['type'] != 'access':
            return {'message': 'Invalid token type'}, 401

        return f(payload['user_id'], *args, **kwargs)

    return decorated


def generate_password_hash(password: str) -> bytes:
    # 将密码字符串转换为字节
    password_bytes = password.encode('utf-8')
    # 生成盐（salt）并哈希密码
    salt = bcrypt.gensalt()
    hashed_password = bcrypt.hashpw(password_bytes, salt)
    return hashed_password


def verify_password(input_password: str, stored_hash: str) -> bool:
    try:
        # 将输入密码转为字节
        input_bytes = input_password.encode('utf-8')
        hash_bytes = stored_hash.encode('utf-8')
        # 比对密码
        return bcrypt.checkpw(input_bytes, hash_bytes)
    except Exception as e:
        print(f"Password verification error: {e}")
        return False
