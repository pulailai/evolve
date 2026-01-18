import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import os from 'os';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * 获取数据目录路径
 * 开发环境：使用项目目录
 * 生产环境：使用 ~/Library/Application Support/MarketFlow/
 */
export function getDataPaths() {
    const isElectron = process.env.ELECTRON_APP === 'true';
    const isDev = process.env.NODE_ENV === 'development';

    let baseDir;

    if (isElectron && !isDev) {
        // Electron 生产环境：使用用户数据目录
        // 不直接导入 electron，而是使用 os.homedir()
        const homedir = os.homedir();
        baseDir = path.join(homedir, 'Library', 'Application Support', 'MarketFlow');
    } else {
        // 开发环境：使用项目目录
        baseDir = path.join(__dirname, '..', '..');
    }

    const paths = {
        // 复盘笔记目录
        DATA_DIR: path.join(baseDir, 'data'),

        // A股分析结果目录
        ANALYSIS_DIR: path.join(baseDir, 'A_Share_Analysis'),

        // 龙虎榜数据目录
        MARKET_DATA_DIR: path.join(baseDir, 'market-data'),

        // 心法笔记目录
        MIND_DATA_DIR: path.join(baseDir, 'mind-data')
    };

    // 确保所有目录存在
    Object.values(paths).forEach(dir => {
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
            console.log(`✅ Created directory: ${dir}`);
        }
    });

    return paths;
}

/**
 * 获取基础目录（用于兼容性）
 */
export function getBaseDir() {
    const isElectron = process.env.ELECTRON_APP === 'true';
    const isDev = process.env.NODE_ENV === 'development';

    if (isElectron && !isDev) {
        const homedir = os.homedir();
        return path.join(homedir, 'Library', 'Application Support', 'MarketFlow');
    } else {
        return path.join(__dirname, '..', '..');
    }
}
