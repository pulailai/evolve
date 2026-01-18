# 应用图标使用说明

## ✅ 已完成

已将你的 Evolve logo 转换为应用图标并配置到项目中。

## 📍 图标位置

- **图标文件**: `build/icon.png` (1024x1024 像素)
- **配置文件**: `package.json` 中的 `build.mac.icon` 字段

## 🔄 重新打包

要使用新图标，请重新运行打包命令：

```bash
npm run electron:build:mac
```

新的 DMG 安装包将使用你的 Evolve logo 作为应用图标。

## 🎨 图标预览

图标采用了你项目的紫色渐变六边形设计，与项目的视觉风格保持一致。

## 💡 提示

- electron-builder 会自动将 PNG 格式转换为 macOS 需要的 .icns 格式
- 图标会显示在 Dock、Launchpad 和应用程序文件夹中
- 如果需要修改图标，只需替换 `build/icon.png` 文件即可
