const { contextBridge, ipcRenderer } = require('electron');

// 暴露安全的 API 给渲染进程
contextBridge.exposeInMainWorld('electron', {
    // 获取应用数据路径
    getAppPath: () => ipcRenderer.invoke('get-app-path'),

    // 获取应用版本
    getVersion: () => ipcRenderer.invoke('get-version'),

    // 检查是否在 Electron 环境中运行
    isElectron: true
});
