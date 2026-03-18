#!/bin/bash

# 🤖 Zalo Analysis Pipeline Starter
# Quét tin nhắn → Phân tích → Báo cáo

set -e

cd "$(dirname "$0")"

# ============================================================
# SETUP
# ============================================================

echo "════════════════════════════════════════════════════"
echo "🤖 ZALO CLAUDE ANALYSIS PIPELINE".center
echo "════════════════════════════════════════════════════"
echo ""

# Kiểm tra dependencies
echo "✓ Kiểm tra dependencies..."

if ! command -v node &> /dev/null; then
    echo "❌ Node.js chưa cài. Tải từ: https://nodejs.org"
    exit 1
fi

if ! command -v python3 &> /dev/null; then
    echo "❌ Python3 chưa cài. Tải từ: https://python.org"
    exit 1
fi

if ! command -v zalo-agent &> /dev/null; then
    echo "❌ zalo-agent chưa cài."
    echo "   npm install -g zalo-agent-cli"
    exit 1
fi

echo "✓ Node.js: $(node --version)"
echo "✓ Python3: $(python3 --version)"
echo "✓ Zalo-agent: $(zalo-agent --version 2>/dev/null || echo 'installed')"
echo ""

# Kiểm tra Zalo login
echo "✓ Kiểm tra Zalo-agent login..."
if zalo-agent status &> /dev/null; then
    echo "✓ Đã đăng nhập Zalo"
else
    echo "⚠️ Chưa đăng nhập. Đăng nhập ngay..."
    zalo-agent login
fi

echo ""
echo "─────────────────────────────────────────────────────"
echo ""

# ============================================================
# MENU
# ============================================================

echo "🎯 Chọn chế độ:"
echo ""
echo "1️⃣  Quét & Phân tích (One-shot)"
echo "2️⃣  Khởi động MCP Server (cho Claude Code)"
echo "3️⃣  Quét Liên tục (Monitoring)"
echo "4️⃣  Xem báo cáo gần nhất"
echo ""

read -p "Chọn (1-4): " choice

echo ""

# ============================================================
# EXECUTE
# ============================================================

case $choice in
    1)
        echo "🤖 Chế độ: Quét & Phân tích (One-shot)"
        echo "─────────────────────────────────────────────────────"
        echo ""
        python3 claude-analyzer.py
        ;;
    
    2)
        echo "🤖 Chế độ: Khởi động MCP Server"
        echo "─────────────────────────────────────────────────────"
        echo ""
        echo "💡 MCP Server sẽ chạy trong terminal này"
        echo "   Để sử dụng Claude Code, mở terminal khác và chạy:"
        echo "   python3 claude-analyzer.py"
        echo ""
        echo "✓ Khởi động MCP Server..."
        node mcp-advanced.js
        ;;
    
    3)
        echo "🤖 Chế độ: Quét Liên tục (Monitoring)"
        echo "─────────────────────────────────────────────────────"
        echo ""
        echo "⏱️ Quét mỗi 60 phút"
        echo "   Nhấn Ctrl+C để dừng"
        echo ""
        
        counter=1
        while true; do
            echo "[$(date '+%Y-%m-%d %H:%M:%S')] Quét lần #$counter"
            python3 claude-analyzer.py > /dev/null 2>&1
            echo "✓ Hoàn tất. Chờ 60 phút..."
            sleep 3600
            counter=$((counter + 1))
        done
        ;;
    
    4)
        echo "🤖 Chế độ: Xem báo cáo gần nhất"
        echo "─────────────────────────────────────────────────────"
        echo ""
        
        if [ ! -d "reports" ]; then
            echo "❌ Không có báo cáo. Hãy chạy quét trước."
            exit 1
        fi
        
        latest=$(ls -t reports/*.md 2>/dev/null | head -1)
        
        if [ -z "$latest" ]; then
            echo "❌ Không có báo cáo. Hãy chạy quét trước."
            exit 1
        fi
        
        echo "📄 Báo cáo gần nhất: $latest"
        echo ""
        cat "$latest"
        ;;
    
    *)
        echo "❌ Lựa chọn không hợp lệ"
        exit 1
        ;;
esac

echo ""
echo "✅ Hoàn tất!"
