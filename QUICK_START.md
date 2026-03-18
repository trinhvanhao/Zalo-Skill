# ⚡ QUICK START - Zalo Skill v1.1.0

## 🎯 Trong 2 phút

### 💬 Gửi Tin Nhắn (MỚI!)

```bash
cd ~/Zalo\ Skill

# Gửi bằng tên liên hệ (dễ nhất!)
npm run msg "Hào" "Xin chào!"
npm run msg "San Thật Chất" "Tin nhắn"

# Hoặc bằng ID nếu biết
npm run msg 8672767095770686387 "Hello!"
```

**✅ Xong! Tin nhắn đã gửi**

---

## 📊 Personal Analyzer - Tạo Báo Cáo

### 1️⃣ Setup Telegram (first time only)

```bash
# 1. Get token from @BotFather on Telegram
# 2. Get chat ID from @userinfobot on Telegram

# 3. Add to .env or export:
export TELEGRAM_BOT_TOKEN='123456789:ABCDefGHIjKLmnoPQRStuvWXYZ'
export TELEGRAM_CHAT_ID='987654321'
```

### 2️⃣ Chạy analyzer

```bash
cd ~/Zalo Skill
npm run report:1
```

**Xong! 📊**

---

## 📊 Bạn sẽ nhận được

- ✅ Quét tin nhắn cá nhân Zalo
- ✅ Tạo báo cáo chi tiết
- ✅ Gửi tới Telegram (thông báo + file)

---

## 🎛️ Available Commands

```bash
# 🎯 Recommended: Analyze + Send Telegram
npm run report:1

# 📊 Analyze only (no Telegram)
npm run report:2

# 🤖 Start MCP Server only
npm run mcp

# 🔧 Manual analyze
npm run personal
```

---

## 🔧 Troubleshooting

### MCP Server not running?
```bash
npm run mcp &  # Start in background
```

### Telegram not working?
```bash
# Check config
echo $TELEGRAM_BOT_TOKEN
echo $TELEGRAM_CHAT_ID

# Re-export
export TELEGRAM_BOT_TOKEN='...'
export TELEGRAM_CHAT_ID='...'
```

### Zalo not logged in?
```bash
zalo-agent login
```

---

## 📚 Full Documentation

- **Setup:** PERSONAL_ANALYZER_GUIDE.md
- **Telegram:** TELEGRAM_SETUP.md
- **Workflow:** WORKFLOW.md

---

**That's it! Start with:** `npm run report:1`
