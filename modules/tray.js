const{setThumbarButtons} = require('./setThumbarButtons')
// 托盘图标
const createTray = function (Tray,Menu) {
    const template = [
        {
            label: "退出",
            click: () => {
                global.mainWindow.destroy();
                global.app.quit();
            },
        },
    ]
    const menu = Menu.buildFromTemplate(template);
    const trayIconPath ="./images/tray.ico";
    const appTray = new Tray(trayIconPath);
    appTray.setToolTip("网易云音乐");
    appTray.on("click", (event) => {
        if (global.mainWindow.isVisible()) {
            global.mainWindow.hide();
        } else {
            global.mainWindow.show();
            setThumbarButtons(global.mainWindow, global.playing);//重新设置缩略图按钮
        }

    });
    appTray.setContextMenu(menu);
    return appTray;
};

// 导出函数
module.exports = { createTray };
