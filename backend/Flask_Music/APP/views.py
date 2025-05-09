# 路由+视图函数
from flask import Blueprint, current_app, send_file
from .extension import db
from sqlalchemy import text
from flask import request, jsonify
from APP import utils
from datetime import timedelta, datetime
import os

blue = Blueprint('music', __name__)


@blue.route('/register', methods=['POST'])
def register():
    try:
        # 1.获取传递来的数据
        data = request.get_json()
        username = data.get('username')
        password = data.get('password')
        email = data.get('email')
        nickname = data.get('nickname')
        print(data)
        # 2.验证数据
        if not all([username, email, password, nickname]):
            return jsonify({"error": "缺少必填字段"}), 400
        # 哈希密码
        password_hash = utils.generate_password_hash(password)
        # 检查用户是否存在
        if db.session.execute(
                text('SELECT 1 FROM users WHERE username = :username OR email = :email'),
                {'username': username, 'email': email}
        ).fetchone():
            return jsonify({"message": "用户已存在"}), 409
        print('检查完毕')
        db.session.execute(
            text(
                'INSERT INTO users (username, email, password_hash,nickname) VALUES (:username,:email,:password_hash,'
                ':nickname)'),
            {'username': username, 'email': email, 'password_hash': password_hash, 'nickname': nickname})
        db.session.commit()
        return jsonify({
            'status': 'success',
            'message': '注册成功'
        })
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500


@blue.route('/login', methods=['POST'])
def login():
    # 1.获取传递来的数据
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')
    # 验证是否缺少字段
    if not all([username, password]):
        return jsonify({"error": "缺少必填字段"}), 400
    # 验证身份
    user = db.session.execute(
        text('SELECT user_id,password_hash FROM users WHERE username = :username'),
        {'username': username}
    ).fetchone()
    if user:
        stroed_hashpassword = user.password_hash
        if utils.verify_password(password, stroed_hashpassword):
            access_token = utils.generate_tokens(user.user_id)
            return jsonify(access_token)
        else:
            return jsonify({"message": "账号或密码错误"}), 409
    else:
        return jsonify({"message": "账号或密码错误"}), 409


# 获取歌曲列表
@blue.route('/home', methods=['GET'])
def home():
    # 拿到歌单数据
    songs = db.session.execute(
        text('SELECT song_id,title,artist, false AS is_favorite from songs LIMIT :num'),
        {'num': 10}
    )
    data = [dict(song._mapping) for song in songs]
    return jsonify(data)


# 获取歌曲音频
@blue.route('/getMusicResource', methods=['GET'])
@utils.token_required
def getResource(user_id: int):
    song_id = request.args.get("id", default=1, type=int)
    path = db.session.execute(
        text('SELECT file_path from songs WHERE song_id = :song_id'),
        {'song_id': song_id}
    ).fetchone()
    if path and path[0]:
        file_path = path[0]
        if os.path.exists(file_path):
            return send_file(
                file_path,
                mimetype='audio/wav',
                as_attachment=False,
            )
        else:
            return "File not found", 404
    else:
        return "Song not found", 404


# 获取用户信息用于渲染页面
@blue.route('/getUserInfo', methods=['GET'])
@utils.token_required
def getuserinfo(user_id: int):
    data = db.session.execute(
        text('SELECT nickname FROM users WHERE user_id = :user_id'),
        {'user_id': user_id}
    ).mappings().first()
    if data is not None:
        data_dict = dict(data)
        return jsonify(data_dict)
    else:
        return jsonify({'message': '未找到用户信息'})


# 获取喜欢列表
@blue.route('/getLikes', methods=['GET'])
@utils.token_required
def getlikes(user_id: int):
    try:
        data = db.session.execute(
            text('''
        SELECT 
            song_id, title, artist, true AS is_favorite
        FROM 
            songs s
        JOIN
            user_favorites uf ON s.song_id = uf.song_id
        WHERE
            uf.user_id = :user_id
        '''),
            {
                'user_id': user_id
            }
        )
        data_dict = [dict(row._mapping)for row in data]
    except Exception as e:
        return {'message': 'something bad'}, 500
    return jsonify(data_dict), 200


# 发送喜欢歌曲信息
@blue.route('/sendLikes', methods=['GET'])
@utils.token_required
def sendlikes(user_id: int):
    song_id = request.args.get('id', default=1, type=int)
    if song_id:
        db.session.execute(
            text('''
                INSERT INTO user_favorites (user_id, song_id)
                VALUES (:user_id,:song_id)
                '''),
            {
                'user_id': user_id,
                'song_id': song_id
            }
        )
        return {'message': 'like song has stored'}, 200
    else:
        return {'message': 'send song_id faire'}, 400


# 更新喜欢歌曲表
@blue.route('/updatesongs', methods=['GET'])
@utils.token_required
def updatesongs(user_id: int):
    try:
        song_id = request.args.get('id', default=1, type=int)
        # 参数校验
        if not song_id or song_id <= 0:
            return {'message': 'Invalid song_id'}, 400

        # 检查是否已存在该记录
        result = db.session.execute(
            text('''
                        SELECT 1 FROM user_favorites 
                        WHERE user_id = :user_id AND song_id = :song_id
                        '''),
            {'user_id': user_id, 'song_id': song_id}
        ).fetchone()
        if result:  # 如果已存在，则删除
            db.session.execute(
                text('''
                                DELETE FROM user_favorites 
                                WHERE user_id = :user_id AND song_id = :song_id
                                '''),
                {'user_id': user_id, 'song_id': song_id}
            )
            db.session.commit()
            return {'message': 'Song removed from favorites'}, 204  # 204 No Content
        else:  # 不存在则插入
            db.session.execute(
                text('''
                                INSERT INTO user_favorites (user_id, song_id)
                                VALUES (:user_id, :song_id)
                                '''),
                {'user_id': user_id, 'song_id': song_id}
            )
            db.session.commit()
            return {'message': 'Song added to favorites'}, 201  # 201 Created
    except Exception as e:
        db.session.rollback()
        return {'message': f'An error occurred: {str(e)}'}, 500
