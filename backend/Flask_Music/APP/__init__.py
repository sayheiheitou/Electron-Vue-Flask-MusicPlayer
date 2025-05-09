#初始化文件，创建flask应用
from config import Config
from flask import Flask
from .views import *
from .extension import db

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)
    # 初始化扩展
    db.init_app(app)
    #注册蓝图
    from.views import blue
    app.register_blueprint(blueprint=blue)
    return app