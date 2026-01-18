# Market Flow - macOS 应用打包说明

## 📦 安装依赖

由于添加了 Electron 相关依赖，需要重新安装：

```bash
npm install
```

这将安装：
- `electron` - Electron 框架
- `electron-builder` - macOS 应用打包工具
- `wait-on` - 等待服务启动的工具

## 🚀 运行模式

### 1. 开发模式（原有方式）

```bash
npm run dev
```

这将启动：
- Express 后端服务器（端口 3001）
- Vite 前端开发服务器（端口 5173）

在浏览器中访问 `http://localhost:5173`

### 2. Electron 开发模式

```bash
npm run electron:dev
```

这将启动：
- Express 后端服务器
- Vite 前端开发服务器
- Electron 桌面应用窗口

**注意**：在开发模式下，数据仍然保存在项目目录中：
- `data/` - 复盘笔记
- `mind-data/` - 心法笔记
- `src/data/` - 龙虎榜数据（开发模式）
- `market-data/` - 龙虎榜数据（生产模式）

## 📱 打包 macOS 应用

### 1. 构建应用

```bash
npm run electron:build:mac
```

这将：
1. 使用 Vite 构建前端资源
2. 使用 electron-builder 打包 macOS 应用
3. 生成 `.app` 文件和 `.dmg` 安装包

打包产物位于 `dist-electron/` 目录：
- `MarketFlow.app` - macOS 应用程序
- `MarketFlow-1.0.0.dmg` - DMG 安装包

### 2. 应用图标（可选）

如果需要自定义应用图标，请：

1. 准备一个 1024x1024 的 PNG 图片
2. 使用在线工具或 macOS 的 `iconutil` 转换为 `.icns` 格式
3. 将生成的 `icon.icns` 放到 `build/` 目录

如果没有图标，electron-builder 会使用默认图标。

## 📂 生产环境数据目录

打包后的应用会将所有数据保存到：

```
~/Library/Application Support/MarketFlow/
├── data/                  # 复盘笔记
├── mind-data/            # 心法笔记
├── market-data/          # 龙虎榜数据
└── A_Share_Analysis/     # A股分析结果
```

## 🎁 分发给朋友

1. 将生成的 `MarketFlow-1.0.0.dmg` 发送给朋友
2. 朋友双击 DMG 文件
3. 拖拽应用到 Applications 文件夹
4. **首次打开**：右键点击应用 → 选择"打开"（绕过未签名警告）

## ⚠️ 注意事项

### 未签名应用

由于没有 Apple Developer 账号，应用是未签名的。朋友首次安装时会看到安全警告。

**解决方法**：
1. 右键点击应用
2. 选择"打开"
3. 在弹出的对话框中点击"打开"

### 数据迁移

如果你有现有的数据需要迁移到打包后的应用：

1. 启动打包后的应用（会自动创建数据目录）
2. 退出应用
3. 复制现有数据：

```bash
# 复制复盘笔记
cp -r /path/to/old/data/* ~/Library/Application\ Support/MarketFlow/data/

# 复制心法笔记
cp -r /path/to/old/mind-data/* ~/Library/Application\ Support/MarketFlow/mind-data/

# 复制龙虎榜数据
cp -r /path/to/old/src/data/* ~/Library/Application\ Support/MarketFlow/market-data/
```

4. 重新启动应用

## 🐛 故障排查

### 应用无法启动

检查控制台日志：

```bash
# 查看应用日志
log show --predicate 'process == "MarketFlow"' --last 5m
```

### 数据未保存

检查数据目录权限：

```bash
ls -la ~/Library/Application\ Support/MarketFlow/
```

确保应用有读写权限。

## 📝 开发说明

### 路径配置

所有数据路径通过 `server/config/paths.js` 统一管理：

- 开发环境：使用项目目录
- 生产环境：使用 `~/Library/Application Support/MarketFlow/`

### 环境检测

通过环境变量判断运行环境：

- `ELECTRON_APP=true` - 在 Electron 中运行
- `NODE_ENV=production` - 生产模式

## 🔄 版本更新

更新版本号：

1. 修改 `package.json` 中的 `version` 字段
2. 重新打包：`npm run electron:build:mac`

新版本的 DMG 文件名会包含新的版本号。
