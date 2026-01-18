#!/bin/bash

echo "=== 衍数应用完整诊断 ==="
echo ""
echo "📍 应用路径: /Applications/衍数.app"
echo ""

# 检查应用是否存在
if [ ! -d "/Applications/衍数.app" ]; then
    echo "❌ 应用未安装到 /Applications/"
    echo "请先将应用从 DMG 拖到应用程序文件夹"
    exit 1
fi

echo "✅ 应用已安装"
echo ""

# 检查 app.asar.unpacked 目录
echo "📦 检查解包文件..."
if [ -d "/Applications/衍数.app/Contents/Resources/app.asar.unpacked" ]; then
    echo "✅ app.asar.unpacked 存在"
    echo ""
    echo "📄 解包文件列表:"
    ls -la "/Applications/衍数.app/Contents/Resources/app.asar.unpacked/" | head -20
else
    echo "❌ app.asar.unpacked 不存在"
fi

echo ""
echo "🚀 启动应用并捕获所有输出..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# 启动应用并捕获所有输出
"/Applications/衍数.app/Contents/MacOS/衍数" 2>&1
