# 🤖 Zalo AI Auto-Reply Bot

Bot Zalo tự động trả lời thông minh sử dụng Gemini AI.

## 🎯 Tính năng

- ✅ **Lắng nghe tin nhắn** từ Zalo (cá nhân + nhóm)
- ✅ **Xử lý AI** với Gemini 2.0
- ✅ **Trả lời tự động** dựa trên kiến thức
- ✅ **Hoạt động 24/7** trên VPS
- ✅ **Dễ tùy chỉnh** kiến thức

## ⚙️ Setup

### 1. Cài đặt dependencies

```bash
cd ~/Zalo Skill
npm install
```

### 2. Lấy Gemini API Key

1. Truy cập: https://aistudio.google.com
2. Nhấn **"Get API Key"**
3. Tạo API key mới
4. Copy key

### 3. Cấu hình .env

```bash
# Mở file .env
nano .env

# Thay: AIzaSyC...THAY_BẰNG_KEY_CỦA_BẠN
# Bằng: Your_Actual_API_Key_Here

# Lưu: Ctrl+O → Enter → Ctrl+X
```

### 4. Kiểm tra zalo-agent

```bash
zalo-agent status
```

Phải hiển thị: ✓ Logged in

## 🚀 Chạy bot

```bash
npm start
```

**Output:**
```
════════════════════════════════════════════════════════
🤖 ZALO AI AUTO-REPLY BOT v1.0
════════════════════════════════════════════════════════
✓ Gemini API key: AIzaSyC...
✓ Zalo-agent: ✓ Đã đăng nhập
────────────────────────────────────────────────────────
📚 Kiến thức được dạy:
   • Gạo Việt Nam (sạch, hữu cơ)
   • Thị trường, giá cả
   • Thông tin công ty
────────────────────────────────────────────────────────

🤖 Khởi động Zalo AI Bot...
👂 Lắng nghe tin nhắn...

📨 [15:10:30] Tin nhắn #1
   Từ: 👤 Hào
   Nội dung: "Bạn bán gạo gì?"
   🤔 Đang suy nghĩ...
   💬 Trả lời: "Chúng tôi bán gạo sạch & hữu cơ chất lượng cao"
   ✓ Đã gửi trả lời tới 👤 cá nhân
```

## 📚 Tùy chỉnh kiến thức

Mở file `bot.js` và sửa **SYSTEM_PROMPT**:

```javascript
const SYSTEM_PROMPT = `Bạn là một trợ lý Zalo thông minh...

📚 KIẾN THỨC:
1. Về sản phẩm: ...
2. Về dịch vụ: ...
3. Hotline: 0902-273-991
...
`;
```

## 🚀 Deploy trên VPS (24/7)

### Sử dụng PM2

```bash
# Cài PM2
npm install -g pm2

# Tạo config
cat > ecosystem.config.js << 'EOF'
module.exports = {
  apps: [{
    name: "zalo-bot",
    script: "./bot.js",
    instances: 1,
    exec_mode: "fork",
    env: { NODE_ENV: "production" },
    error_file: "./logs/err.log",
    out_file: "./logs/out.log",
    watch: false,
    max_memory_restart: "500M"
  }]
};
EOF

# Chạy
pm2 start ecosystem.config.js

# Xem logs
pm2 logs zalo-bot

# Tự động chạy khi boot
pm2 startup
pm2 save
```

### Hoặc dùng Screen (đơn giản)

```bash
# Tạo screen session
screen -S zalo-bot

# Chạy bot
npm start

# Rời khỏi (Ctrl+A+D)
# Quay lại: screen -r zalo-bot
```

## ⚠️ Lưu ý

- ⚠️ **Chỉ 1 listener** cho mỗi tài khoản (không mở Zalo Web lúc bot chạy)
- ⚠️ **Rate limit** của Gemini: ~60 tin/phút
- ⚠️ **Chi phí** Gemini: ~$0.40 per 1,000 tin nhắn
- ⚠️ **Bảo mật** .env - Không commit lên Git!

## 🛠️ Troubleshooting

### Bot không nhận tin
```bash
# Kiểm tra zalo-agent status
zalo-agent status

# Nếu "Not logged in", đăng nhập lại:
zalo-agent login --qr-url
```

### Lỗi Gemini API
```
❌ Error 429: Rate limit
→ Chờ vài giây rồi thử lại

❌ Error 401: Invalid API key
→ Kiểm tra .env có API key đúng không
```

### Bot chạy nhưng không trả lời
```bash
# Kiểm tra logs
npm start
# Xem chi tiết lỗi

# Hoặc dùng dev mode
npm run dev
```

## 📞 Support

- **Zalo**: 0902-273-991
- **Email**: contact@luagaothatchat.vn
- **Gemini Help**: https://ai.google.dev/

---

**Made with ❤️ by Zalo AI Bot Team**
