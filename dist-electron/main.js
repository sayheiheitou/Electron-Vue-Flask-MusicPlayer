"use strict";
const { app, BrowserWindow, ipcMain, Tray, Menu } = require("electron/main");
const { createTray } = require("./modules/tray");
const pkg = require("./package.json");
const path = require("node:path");
const previewIcon = "images/tray.ico";
const { setThumbarButtons } = require("./modules/setThumbarButtons");
const fs = require("fs");
require("path");
const SONGS_FILE = path.join(__dirname, "songs.json");
const LIKED_SONGS_FILE = path.join(__dirname, "likedList");
const HISTORY_LIST_FILE = path.join(__dirname, "historyList.json");
global.app = app;
global.playing = false;
let mainWindow = null;
let cachedFiles = [];
let likedList = [];
let historyList = [];
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
      preload: path.join(__dirname, "preload.js")
    }
  });
  mainWindow.loadURL("http://localhost:3000");
  mainWindow.webContents.openDevTools();
  mainWindow.on("close", (event) => {
    event.preventDefault();
    mainWindow.hide();
  });
};
function getFiles(folderPath) {
  try {
    cachedFiles = loadJsonFile(SONGS_FILE, []);
    if (cachedFiles.length === 0) {
      console.warn("songs.json is empty or does not exist. Initializing from folder...");
      cachedFiles = fs.readdirSync(folderPath).map((fileName, index) => ({
        id: index,
        name: fileName,
        path: path.join(folderPath, fileName),
        like: false
      }));
      fs.writeFileSync(SONGS_FILE, JSON.stringify(cachedFiles, null, 2));
      console.log("Saved songs to JSON:", cachedFiles[0]);
    } else {
      console.log("Loaded songs from JSON:", cachedFiles[0]);
    }
    return cachedFiles;
  } catch (error) {
    console.error("Failed to load files:", error);
    return null;
  }
}
function loadJsonFile(filePath, defaultValue = []) {
  try {
    if (fs.existsSync(filePath)) {
      console.log(`${filePath} exists, loading...`);
      const data = fs.readFileSync(filePath, "utf-8");
      if (data.trim() === "") {
        console.warn(`${filePath} is empty. Initializing with default value.`);
        return defaultValue;
      } else {
        const jsonData = JSON.parse(data);
        console.log(`Loaded data from ${filePath}:`, jsonData[0]);
        return jsonData;
      }
    } else {
      console.warn(`${filePath} does not exist. Initializing with default value.`);
      return defaultValue;
    }
  } catch (error) {
    console.error(`Failed to read ${filePath}:`, error);
    return defaultValue;
  }
}
const getFileByIndex = (index) => {
  if (index < 0 || index >= cachedFiles.length) {
    throw new Error("index out of bounds");
  }
  return cachedFiles[index];
};
app.disableHardwareAcceleration();
app.whenReady().then(
  () => {
    getFiles("E:/GTZA/GTZAN/data/source/genres_original/blues");
    likedList = loadJsonFile(LIKED_SONGS_FILE);
    historyList = loadJsonFile(HISTORY_LIST_FILE, []);
    console.log("History List:", historyList);
    ipcMain.on("updatelike", (event, index) => {
      console.log("The back likeSong index:", index);
      cachedFiles[index].like = !cachedFiles[index].like;
    });
    ipcMain.on("getSongs", (event, arg) => {
      console.log("1 request Lists");
      if (cachedFiles.length > 0) {
        const response = {
          songList: cachedFiles,
          likedList,
          // 发送喜欢列表
          historysList: historyList
          // 发送历史列表
        };
        console.log("2 List prepared:", response.songList[0].name);
        event.reply("songsList", response);
        console.log("History List:", response.historysList);
      } else {
        event.reply("songsList", []);
      }
    });
    ipcMain.handle("read-music-file", async (event, index) => {
      try {
        console.log("The back index:", index);
        const file = getFileByIndex(index);
        const data = fs.readFileSync(file.path);
        return data;
      } catch (error) {
        console.error("read file faiure:", error);
        throw error;
      }
    });
    app.on("before-quit", () => {
      fs.writeFileSync(SONGS_FILE, JSON.stringify(cachedFiles, null, 2));
      likedList = cachedFiles.filter((song) => song.like);
      fs.writeFileSync(LIKED_SONGS_FILE, JSON.stringify(likedList, null, 2));
    });
    createWindow();
    setThumbarButtons(mainWindow, global.playing);
    app.setAppUserModelId(pkg.appId);
    mainWindow.setMenu(null);
    global.tray = createTray(Tray, Menu);
  }
);
