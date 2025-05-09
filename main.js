const { app, BrowserWindow,ipcMain,Tray,Menu } = require('electron/main')
const { createTray } = require('./modules/tray')
const pkg = require('./package.json')
const path = require('node:path')
const previewIcon = "images/tray.ico"
const { setThumbarButtons } = require('./modules/setThumbarButtons')// 设置底部任务栏按钮和缩略图
const fs = require('fs')
const paths = require('path')
const SONGS_FILE = path.join(__dirname, 'songs.json'); // JSON 文件路径
const LIKED_SONGS_FILE = path.join(__dirname, 'likedList'); // 新的 JSON 文件路径
const HISTORY_LIST_FILE = path.join(__dirname, 'historyList.json'); // 历史列表文件路径
global.app = app
global.playing = false
let mainWindow = null;
let cachedFiles = [];//缓存文件列表
let likedList = [];//缓存喜欢列表
let historyList = [];//缓存历史列表
// 创建窗口
const createWindow = () => {
  global.mainWindow = mainWindow = new BrowserWindow({
    width: 1200,
    height: 900,
    title: process.platform === "win32" ? "万宇勋音乐" : "nih",
    icon: previewIcon,
    show: true,
    //需要一个具体地址
    webPreferences: {
      webSecurity: true,
        nodeIntegration: false,
        enableRemoteModule: true,
        contextIsolation: true,
        preload: path.join(__dirname, 'preload.js')
      }
  })
  mainWindow.loadURL('http://localhost:3000')
  mainWindow.webContents.openDevTools();
  mainWindow.on('close', (event) => {
    event.preventDefault();
    mainWindow.hide();
  })

}
// 获取文件列表并缓存
function getFiles(folderPath) {
  try {
    // 使用 loadJsonFile 加载 JSON 文件
    cachedFiles = loadJsonFile(SONGS_FILE, []); // 如果文件不存在或为空，返回空数组

    if (cachedFiles.length === 0) {
      console.warn('songs.json is empty or does not exist. Initializing from folder...');
      // 如果 JSON 文件为空或不存在，从文件夹读取并生成元信息
      cachedFiles = fs.readdirSync(folderPath).map((fileName, index) => ({
        id: index,
        name: fileName,
        path: path.join(folderPath, fileName),
        like: false,
      }));

      // 将元信息保存到 JSON 文件
      fs.writeFileSync(SONGS_FILE, JSON.stringify(cachedFiles, null, 2));
      console.log('Saved songs to JSON:', cachedFiles[0]);
    } else {
      console.log('Loaded songs from JSON:', cachedFiles[0]);
    }

    return cachedFiles;
  } catch (error) {
    console.error('Failed to load files:', error);
    return null;
  }
}

function loadJsonFile(filePath, defaultValue = []) {
  try {
    if (fs.existsSync(filePath)) {
      console.log(`${filePath} exists, loading...`);
      const data = fs.readFileSync(filePath, 'utf-8');
      if (data.trim() === '') {
        console.warn(`${filePath} is empty. Initializing with default value.`);
        return defaultValue; // 如果文件为空，返回默认值
      } else {
        const jsonData = JSON.parse(data); // 解析 JSON 数据
        console.log(`Loaded data from ${filePath}:`, jsonData[0]);
        return jsonData;
      }
    } else {
      console.warn(`${filePath} does not exist. Initializing with default value.`);
      return defaultValue; // 如果文件不存在，返回默认值
    }
  } catch (error) {
    console.error(`Failed to read ${filePath}:`, error);
    return defaultValue; // 如果读取失败，返回默认值
  }
}

// 根据索引获取文件
const getFileByIndex = (index) => {
  if (index < 0 || index >= cachedFiles.length) {
    throw new Error('index out of bounds');
  }
  return cachedFiles[index];
};
//应用初始化
app.disableHardwareAcceleration();//禁用硬件加速

app.whenReady().then(() => {
  //缓存文件信息
  getFiles('E:/GTZA/GTZAN/data/source/genres_original/blues')
  likedList = loadJsonFile(LIKED_SONGS_FILE); // 加载喜欢列表
  historyList = loadJsonFile(HISTORY_LIST_FILE,[]); // 加载历史列表
  console.log('History List:', historyList); // 打印历史列表
  //监听歌曲喜欢事件
  ipcMain.on('updatelike', (event, index) => {
    console.log('The back likeSong index:',index)
    cachedFiles[index].like = !cachedFiles[index].like; // 切换喜欢状态
  })
  //监听获取歌曲列表事件
  ipcMain.on('getSongs', (event, arg) => {
    console.log('1 request Lists') // 打印从渲染进程接收到的消息
    if (cachedFiles.length > 0) {
      const response = {
        songList: cachedFiles,
        likedList: likedList, // 发送喜欢列表
        historysList: historyList, // 发送历史列表
      }
      console.log('2 List prepared:', response.songList[0].name) // 打印要发送的消息
      event.reply('songsList', response); // 将文件列表发送回渲染进程
      console.log('History List:', response.historysList); // 打印历史列表
    } else {
      event.reply('songsList', []); // 如果没有文件，发送空数组
    }
  })
  // 监听获取歌曲文件
  ipcMain.handle('read-music-file', async (event, index) => {
    try {
      console.log('The back index:', index); // 打印路径
      const file = getFileByIndex(index); // 获取文件
      const data = fs.readFileSync(file.path); // 读取文件
      return data; // 返回文件数据
    } catch (error) {
      console.error('read file faiure:', error);
      throw error;
    }
  });
  app.on('before-quit', () => {
    // 在退出前将更新的文件列表重新写回 JSON 文件
    fs.writeFileSync(SONGS_FILE, JSON.stringify(cachedFiles, null, 2));
    likedList = cachedFiles.filter(song => song.like); // 再次过滤出喜欢的歌曲并保存
    fs.writeFileSync(LIKED_SONGS_FILE, JSON.stringify(likedList, null, 2)); // 保存喜欢列表
  });
  createWindow();
  setThumbarButtons(mainWindow, global.playing);
   // 设置appId才能使用Notification
  app.setAppUserModelId(pkg.appId);
  // 去除原生顶部菜单栏
  mainWindow.setMenu(null);
//   // 如果是windows系统模拟托盘菜单
  global.tray = createTray(Tray,Menu);
 }

)