import { app, BrowserWindow, ipcMain } from 'electron';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import os from 'os';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let mainWindow;

const isDev = !app.isPackaged;

// 创建日志文件
const logFile = path.join(os.homedir(), 'Desktop', 'yanshuo-debug.log');
function log(message) {
    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] ${message}\n`;
    console.log(logMessage);
    try {
        fs.appendFileSync(logFile, logMessage);
    } catch (err) {
        console.error('Failed to write log:', err);
    }
}

log('=== 衍数应用启动 ===');
log(`isDev: ${isDev}`);
log(`__dirname: ${__dirname}`);
log(`process.resourcesPath: ${process.resourcesPath || 'undefined'}`);
log(`app.isPackaged: ${app.isPackaged}`);
log(`Node version: ${process.version}`);
log(`Electron version: ${process.versions.electron}`);
log(`Platform: ${process.platform}`);
log(`Arch: ${process.arch}`);

// 捕获未处理的错误
process.on('uncaughtException', (error) => {
    log(`❌ Uncaught Exception: ${error.message}`);
    log(error.stack);
});

process.on('unhandledRejection', (reason, promise) => {
    log(`❌ Unhandled Rejection at: ${promise}`);
    log(`Reason: ${reason}`);
});

function createWindow() {
    log('📱 Creating main window...');
    mainWindow = new BrowserWindow({
        width: 1400,
        height: 900,
        minWidth: 1200,
        minHeight: 700,
        title: '衍数 | Evolve',
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            preload: path.join(__dirname, 'electron-preload.js')
        },
        backgroundColor: '#0f172a',
        titleBarStyle: 'hiddenInset',
        trafficLightPosition: { x: 16, y: 12 } // 调整以适配40px标题栏
    });

    // 开发模式：加载 Vite 开发服务器
    // 生产模式：加载打包后的文件
    if (isDev) {
        log('🔧 Development mode: loading from Vite dev server');
        mainWindow.loadURL('http://localhost:5173');
        mainWindow.webContents.openDevTools();
    } else {
        // 生产环境：从 app.asar 中加载
        const rendererPath = path.join(process.resourcesPath, 'app.asar', 'dist-electron', 'renderer', 'index.html');
        log(`📦 Production mode: loading from ${rendererPath}`);
        mainWindow.loadFile(rendererPath).catch(err => {
            log(`❌ Failed to load renderer: ${err.message}`);
        });
    }

    mainWindow.on('closed', () => {
        mainWindow = null;
    });
}

async function startServer() {
    try {
        let serverPath;

        if (isDev) {
            // 开发环境:直接使用项目目录中的 server.js
            serverPath = path.join(__dirname, 'server.js');
        } else {
            // 生产环境:从 app.asar.unpacked 中加载
            serverPath = path.join(process.resourcesPath, 'app.asar.unpacked', 'server.js');
        }

        log(`🚀 Starting server from: ${serverPath}`);

        // 检查文件是否存在
        if (!fs.existsSync(serverPath)) {
            const error = `❌ Server file not found: ${serverPath}`;
            log(error);
            throw new Error(error);
        }
        log(`✅ Server file exists`);

        // 直接导入并运行服务器模块,而不是 spawn 新进程
        // 这样可以避免需要找到正确的 Node.js 二进制文件路径
        log(`📡 Importing server module...`);

        // 使用动态 import 加载服务器
        await import(serverPath);

        log(`✅ Server module loaded and started`);

        // 等待服务器完全启动
        await new Promise(resolve => setTimeout(resolve, 2000));

        console.log('Server started on port 3001');
    } catch (err) {
        log(`❌ Server startup error: ${err.message}`);
        log(err.stack);
        throw err;
    }
}

app.whenReady().then(async () => {
    log('✅ Electron app ready');
    try {
        log('📡 Starting backend server...');
        await startServer();
        log('✅ Backend server started');
        createWindow();
        log('✅ Main window created');

        app.on('activate', () => {
            if (BrowserWindow.getAllWindows().length === 0) {
                createWindow();
            }
        });
    } catch (error) {
        log(`❌ Failed to start application: ${error.message}`);
        log(error.stack);
        console.error('Failed to start application:', error);
        app.quit();
    }
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

// IPC handlers
ipcMain.handle('get-app-path', () => {
    return app.getPath('userData');
});

ipcMain.handle('get-version', () => {
    return app.getVersion();
});
