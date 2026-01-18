#!/bin/bash

echo "=== 衍数应用诊断工具 ==="
echo ""

APP_PATH="/Users/puhongtao/Documents/分析数据/market-flow/dist-electron/mac-arm64/衍数.app"

if [ ! -d "$APP_PATH" ]; then
    echo "❌ 应用不存在: $APP_PATH"
    exit 1
fi

echo "✅ 应用存在"
echo ""

echo "📦 检查应用结构..."
echo "- Contents/MacOS/衍数:"
ls -lh "$APP_PATH/Contents/MacOS/衍数" 2>&1 | head -1

echo "- Contents/Resources/app.asar:"
ls -lh "$APP_PATH/Contents/Resources/app.asar" 2>&1 | head -1

echo ""
echo "🚀 尝试启动应用..."
echo "按 Ctrl+C 停止"
echo ""

"$APP_PATH/Contents/MacOS/衍数"
