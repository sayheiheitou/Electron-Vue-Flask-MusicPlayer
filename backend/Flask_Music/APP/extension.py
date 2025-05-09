#添加扩展对象，例如数据库连接对象
from flask_sqlalchemy import SQLAlchemy

# 先创建扩展对象，但不初始化
db = SQLAlchemy()