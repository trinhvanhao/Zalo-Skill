#!/bin/bash

# 🤖 Complete Zalo Analysis Pipeline
# Quét MCP → Phân tích tin nhắn cá nhân → Gửi Telegram

set -e

cd "$(dirname "$0")"

# ============================================================
# COLORS
# ============================================================

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# ============================================================
# BANNER
# ============================================================

echo -e "${BLUE}════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}🤖 ZALO PERSONAL ANALYZER - COMPLETE PIPELINE${NC}"
echo -e "${BLUE}════════════════════════════════════════════════════${NC}"
echo ""

# ============================================================
# CHECKS
# ============================================================

echo -e "${YELLOW}✓ Checking dependencies...${NC}"

# Check Node.js
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js not found${NC}"
    exit 1
fi

# Check Python3
if ! command -v python3 &> /dev/null; then
    echo -e "${RED}❌ Python3 not found${NC}"
    exit 1
fi

# Check zalo-agent
if ! command -v zalo-agent &> /dev/null; then
    echo -e "${RED}❌ zalo-agent not found${NC}"
    echo "   npm install -g zalo-agent-cli"
    exit 1
fi

echo -e "${GREEN}✓ Node.js: $(node --version)${NC}"
echo -e "${GREEN}✓ Python3: $(python3 --version)${NC}"
echo ""

# Check Zalo login
echo -e "${YELLOW}✓ Checking Zalo login status...${NC}"
if zalo-agent status &> /dev/null; then
    echo -e "${GREEN}✓ Logged in to Zalo${NC}"
else
    echo -e "${RED}❌ Not logged in to Zalo${NC}"
    echo "   Run: zalo-agent login"
    exit 1
fi

# Check Telegram config
if [ -z "$TELEGRAM_BOT_TOKEN" ] || [ -z "$TELEGRAM_CHAT_ID" ]; then
    echo -e "${YELLOW}⚠️  Telegram not configured${NC}"
    echo "   Setup: export TELEGRAM_BOT_TOKEN='...'"
    echo "   Setup: export TELEGRAM_CHAT_ID='...'"
    echo ""
    echo "   Or add to .env file"
    echo ""
fi

# Check MCP Server
echo ""
echo -e "${YELLOW}✓ Checking MCP Server...${NC}"

if pgrep -f "mcp-advanced.js" > /dev/null; then
    echo -e "${GREEN}✓ MCP Server is running (PID: $(pgrep -f mcp-advanced.js))${NC}"
else
    echo -e "${RED}⚠️  MCP Server NOT running${NC}"
    echo ""
    echo -e "${YELLOW}Starting MCP Server in background...${NC}"
    
    # Start MCP Server in background
    npm run mcp > /tmp/mcp.log 2>&1 &
    MCP_PID=$!
    
    echo -e "${GREEN}✓ MCP Server started (PID: $MCP_PID)${NC}"
    
    # Wait for it to be ready
    sleep 2
    
    if ! ps -p $MCP_PID > /dev/null; then
        echo -e "${RED}❌ MCP Server failed to start${NC}"
        cat /tmp/mcp.log
        exit 1
    fi
    
    echo -e "${GREEN}✓ MCP Server is ready${NC}"
fi

echo ""
echo -e "${BLUE}─────────────────────────────────────────────────${NC}"
echo ""

# ============================================================
# MAIN PIPELINE
# ============================================================

echo -e "${BLUE}🚀 STARTING ANALYSIS PIPELINE${NC}"
echo ""

# Step 1: Show menu if first argument not provided
if [ -z "$1" ]; then
    echo -e "${YELLOW}Choose mode:${NC}"
    echo ""
    echo "1️⃣  Analyze & Send to Telegram (recommended)"
    echo "2️⃣  Analyze Only (no Telegram)"
    echo "3️⃣  Just get MCP Server info"
    echo "4️⃣  Stop MCP Server"
    echo ""
    read -p "Choose (1-4): " choice
else
    choice=$1
fi

echo ""

case $choice in
    1)
        echo -e "${BLUE}📊 STEP 1: Collecting personal messages...${NC}"
        echo ""
        
        python3 personal-analyzer.py
        
        echo ""
        echo -e "${GREEN}✅ ANALYSIS COMPLETE!${NC}"
        echo ""
        echo -e "${BLUE}📁 Reports location: $(pwd)/reports${NC}"
        echo ""
        ;;
    
    2)
        echo -e "${BLUE}📊 STEP 1: Collecting personal messages (No Telegram)...${NC}"
        echo ""
        
        # Run analyzer without Telegram
        TELEGRAM_BOT_TOKEN="" TELEGRAM_CHAT_ID="" python3 personal-analyzer.py
        
        echo ""
        echo -e "${GREEN}✅ ANALYSIS COMPLETE!${NC}"
        echo ""
        ;;
    
    3)
        echo -e "${BLUE}ℹ️  MCP Server Information${NC}"
        echo ""
        
        if pgrep -f "mcp-advanced.js" > /dev/null; then
            PID=$(pgrep -f "mcp-advanced.js")
            echo -e "${GREEN}✓ MCP Server is running${NC}"
            echo "   PID: $PID"
            echo "   Process: $(ps -p $PID -o comm=)"
        else
            echo -e "${RED}❌ MCP Server is NOT running${NC}"
            echo "   Start with: npm run mcp"
        fi
        echo ""
        ;;
    
    4)
        echo -e "${BLUE}🛑 Stopping MCP Server...${NC}"
        echo ""
        
        if pkill -f "mcp-advanced.js"; then
            echo -e "${GREEN}✓ MCP Server stopped${NC}"
        else
            echo -e "${YELLOW}⚠️  MCP Server was not running${NC}"
        fi
        echo ""
        ;;
    
    *)
        echo -e "${RED}❌ Invalid choice${NC}"
        exit 1
        ;;
esac

echo -e "${BLUE}════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}Done!${NC}"
echo -e "${BLUE}════════════════════════════════════════════════════${NC}"
