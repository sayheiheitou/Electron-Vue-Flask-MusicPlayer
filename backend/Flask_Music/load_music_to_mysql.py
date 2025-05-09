import os
import pymysql
from mutagen.wave import WAVE
from mutagen.mp3 import MP3
from mutagen.id3 import ID3
from mutagen.flac import FLAC
from mutagen.oggvorbis import OggVorbis
from datetime import datetime


def get_music_metadata(file_path):
    """提取音乐文件的元数据，支持WAV、MP3、FLAC和OGG格式"""
    try:
        file_ext = os.path.splitext(file_path)[1].lower()

        if file_ext == '.wav':
            audio = WAVE(file_path)
            # WAV文件通常没有标准元数据，使用文件名作为标题
            file_name = os.path.splitext(os.path.basename(file_path))[0]
            metadata = {
                'title': file_name,
                'artist': '未知艺术家',
                'album': '未知专辑',
                'duration': int(audio.info.length),
                'genre': '未知流派',
                'year': None
            }
        elif file_ext == '.mp3':
            audio = MP3(file_path)
            tags = ID3(file_path)
            metadata = {
                'title': tags.get('TIT2', ['未知标题'])[0],
                'artist': tags.get('TPE1', ['未知艺术家'])[0],
                'album': tags.get('TALB', ['未知专辑'])[0],
                'duration': int(audio.info.length),
                'genre': tags.get('TCON', ['未知流派'])[0] if 'TCON' in tags else '未知流派',
                'year': int(str(tags.get('TDRC', ['0'])[0])[:4]) if 'TDRC' in tags else None
            }
        elif file_ext == '.flac':
            audio = FLAC(file_path)
            metadata = {
                'title': audio.get('title', ['未知标题'])[0],
                'artist': audio.get('artist', ['未知艺术家'])[0],
                'album': audio.get('album', ['未知专辑'])[0],
                'duration': int(audio.info.length),
                'genre': audio.get('genre', ['未知流派'])[0],
                'year': int(audio.get('date', ['0'])[0][:4]) if 'date' in audio else None
            }
        elif file_ext == '.ogg':
            audio = OggVorbis(file_path)
            metadata = {
                'title': audio.get('title', ['未知标题'])[0],
                'artist': audio.get('artist', ['未知艺术家'])[0],
                'album': audio.get('album', ['未知专辑'])[0],
                'duration': int(audio.info.length),
                'genre': audio.get('genre', ['未知流派'])[0],
                'year': int(audio.get('date', ['0'])[0][:4]) if 'date' in audio else None
            }
        else:
            return None

        # 清理数据，确保没有过长的字符串
        for key in metadata:
            if isinstance(metadata[key], str) and len(metadata[key]) > 255:
                metadata[key] = metadata[key][:255]

        return metadata

    except Exception as e:
        print(f"提取元数据出错: {str(e)}")
        return None


def import_music_to_db(music_folder, db_config):
    """将音乐文件夹中的音乐导入数据库"""
    try:
        # 连接数据库
        conn = pymysql.connect(**db_config)
        cursor = conn.cursor()

        # 统计变量
        total_files = 0
        imported_files = 0
        skipped_files = 0

        print(f"开始扫描音乐文件夹: {music_folder}")

        # 支持的音频格式
        supported_formats = ('.wav', '.mp3', '.flac', '.ogg')

        # 遍历音乐文件夹
        for root, dirs, files in os.walk(music_folder):
            for file in files:
                file_path = os.path.join(root, file)
                file_ext = os.path.splitext(file)[1].lower()

                # 只处理支持的音频文件
                if file_ext in supported_formats:
                    total_files += 1
                    print(f"\n处理文件 {total_files}: {file}")

                    # 检查文件是否已在数据库中
                    cursor.execute("SELECT song_id FROM songs WHERE file_path = %s", (file_path,))
                    if cursor.fetchone():
                        print(f"文件已存在，跳过: {file}")
                        skipped_files += 1
                        continue

                    # 提取元数据
                    metadata = get_music_metadata(file_path)
                    if not metadata:
                        print(f"无法提取元数据，跳过: {file}")
                        skipped_files += 1
                        continue

                    # 插入数据库
                    try:
                        insert_query = """
                        INSERT INTO songs (
                            title, artist, album, duration, file_path, 
                            genre, release_year, created_at, updated_at
                        ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)
                        """
                        current_time = datetime.now()
                        cursor.execute(insert_query, (
                            metadata['title'],
                            metadata['artist'],
                            metadata['album'],
                            metadata['duration'],
                            file_path,
                            metadata['genre'],
                            metadata['year'],
                            current_time,
                            current_time
                        ))

                        conn.commit()
                        imported_files += 1
                        print(f"成功导入: {metadata['title']} - {metadata['artist']}")

                    except pymysql.Error as e:
                        conn.rollback()
                        print(f"数据库插入失败: {str(e)}")
                        skipped_files += 1

        # 打印汇总信息
        print("\n导入完成!")
        print(f"总文件数: {total_files}")
        print(f"成功导入: {imported_files}")
        print(f"跳过文件: {skipped_files}")

    except pymysql.Error as e:
        print(f"数据库连接错误: {str(e)}")
    finally:
        if 'conn' in locals() and conn.open:
            cursor.close()
            conn.close()


if __name__ == "__main__":
    # 数据库配置
    db_config = {
        'host': 'localhost',
        'user': 'root',
        'password': '123456',
        'database': 'music',
        'charset': 'utf8mb4',
        'cursorclass': pymysql.cursors.DictCursor
    }

    # 音乐文件夹路径
    music_folder = "E:\\GTZA\\GTZAN\\data\\source\\genres_original"

    # 验证路径是否存在
    if not os.path.isdir(music_folder):
        print("错误: 指定的路径不存在或不是文件夹")
    else:
        import_music_to_db(music_folder, db_config)