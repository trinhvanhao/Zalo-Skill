#!/bin/bash

# 📱 Zalo Personal Analyzer - Docx Report Creator
# Tạo báo cáo Word (.docx) từ tin nhắn cá nhân Zalo
# Lưu: ~/Zalo Skill/reports/

set -e

cd "$(dirname "$0")"

echo ""
echo "════════════════════════════════════════════════════"
echo "📱 ZALO PERSONAL ANALYZER - DOCX REPORT"
echo "════════════════════════════════════════════════════"
echo ""

# Kiểm tra dependencies
echo "✓ Kiểm tra requirements..."

if ! command -v python3 &> /dev/null; then
    echo "❌ Python3 not found"
    exit 1
fi

if ! command -v zalo-agent &> /dev/null; then
    echo "❌ zalo-agent not found"
    exit 1
fi

# Kiểm tra Zalo login
echo "✓ Kiểm tra Zalo login..."
if ! zalo-agent status &> /dev/null; then
    echo "❌ Not logged in to Zalo"
    echo "   Run: zalo-agent login"
    exit 1
fi

echo ""
echo "─────────────────────────────────────────────────────"
echo ""

# Chạy analyzer
echo "🚀 Tạo báo cáo..."
echo ""

python3 personal-docx-analyzer.py

echo ""
echo "────────────────────────────────────────────────────"
echo ""
echo "✅ XONG!"
echo ""
echo "📁 Thư mục báo cáo: ~/Zalo Skill/reports/"
echo ""
echo "📱 Mở báo cáo:"
echo "   • Trên Mac: open reports/*.docx"
echo "   • Trên Windows: start reports/*.docx"
echo "   • Trên Linux: libreoffice reports/*.docx"
echo ""
echo "💡 Xem danh sách báo cáo:"
echo "   ls -lh reports/*.docx"
echo ""
