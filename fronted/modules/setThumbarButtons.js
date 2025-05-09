//设置窗口预览缩略图按钮

const pauseIcon = "images/pause.png"
const playIcon = "images/play.png"
const nextIcon = "images/next.png"
const prevIcon = "images/prev.png"
const setThumbarButtons = function (mainWindow, playing) {
    mainWindow.setThumbarButtons([
        {
            tooltip: "上一曲",
            icon: prevIcon,
            click() {
                mainWindow.webContents.send("prev-play");
            },
        },
        {
            tooltip: playing ? "暂停" : "播放",
            icon: playing ? pauseIcon : playIcon,
            click() {
                mainWindow.webContents.send("toggle-play", {
                    value: !playing,
                });
            },
        },
        {
            tooltip: "下一曲",
            icon: nextIcon,
            click() {
                mainWindow.webContents.send("next-play");
            },
        },
    ]);
  };
module.exports = {setThumbarButtons}