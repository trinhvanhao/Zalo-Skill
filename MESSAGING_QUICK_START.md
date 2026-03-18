# 📨 MESSAGING - Quick Start Guide

**Created:** 2026-03-19  
**Status:** ✅ READY TO USE

---

## 🎯 3 CHỨC NĂNG MESSAGING MỚI

### 1️⃣ **Message Sender** - Gửi tin nhắn cá nhân

```bash
# Gửi tin nhắn text
npm run msg 123456789 "Hello!"

# Gửi ảnh
npm run msg 123456789 "Photo" --image ~/photo.jpg

# Gửi file
npm run msg 123456789 "Report" --file ~/report.pdf

# Gửi link
npm run msg 123456789 "Check this" --link https://example.com
```

✨ **Đặc điểm:**
- Gửi text, ảnh, file, link
- Tìm ThreadID bằng: `zalo-agent friend search "Name"`
- Dùng đường dẫn tuyệt đối cho file

---

### 2️⃣ **Friend Manager** - Quản lý bạn bè & KẾT BẠN

```bash
# GỬI LỜI MỜI KẾT BẠN (CHÍNH!)
npm run friends add 123456789

# Kèm lời nhắn
npm run friends add 123456789 "Let's connect!"

# Danh sách bạn
npm run friends list

# Tìm bạn
npm run friends search "Hào"

# Bạn đang online
npm run friends online

# Xem thông tin bạn
npm run friends info 123456789

# Đặt biệt danh
npm run friends alias 123456789 "Hào"

# Lời mời chờ xử lý
npm run friends requests
```

✨ **Đặc điểm:**
- ⭐ Gửi lời mời kết bạn dễ dàng
- Quản lý danh bạ
- Chặn/bỏ chặn người
- Đặt biệt danh

---

### 3️⃣ **Bulk Messenger** - Gửi hàng loạt

```bash
# Gửi tất cả bạn
npm run bulk --all "Happy Birthday!"

# Gửi danh sách cụ thể
npm run bulk --list 111,222,333 "Meeting at 3pm"

# Gửi từ file
npm run bulk --file contacts.txt "Announcement"

# Test trước (không gửi)
npm run bulk --all "Message" --dry-run

# Gửi chậm (tránh spam)
npm run bulk --all "Message" --delay 2
```

✨ **Đặc điểm:**
- Gửi hàng loạt nhanh
- Test trước bằng --dry-run
- Điều chỉnh delay tránh spam

---

## 📝 HOW TO GET ThreadId/UserId

```bash
# Cách 1: Tìm theo tên
zalo-agent friend search "Hào"
# Output: ID: 123456789

# Cách 2: Danh sách tất cả
zalo-agent friend list
# Hiển thị tất cả bạn

# Cách 3: Tìm theo SĐT
zalo-agent friend find "0902123456"

# Cách 4: Tìm theo Zalo username
zalo-agent friend find-username "username123"
```

👉 **Copy ID từ output → dùng trong lệnh**

---

## 💡 REAL-WORLD EXAMPLES

### **Example 1: Gửi báo cáo hàng ngày**
```bash
# 1. Sinh báo cáo
npm run docx

# 2. Gửi cho manager
npm run msg 123456789 "Daily Report" \
  --file ~/Zalo Skill/reports/personal_report_*.docx

# 3. Thông báo team
npm run bulk --group 555555555 "Report sent!"
```

---

### **Example 2: Kết bạn + Welcome Message**
```bash
# 1. Gửi lời mời kết bạn
npm run friends add 987654321 "Let's connect!"

# 2. Chờ chấp nhận (nếu cần)
sleep 5

# 3. Gửi welcome message
npm run msg 987654321 "Welcome! 🎉"
```

---

### **Example 3: Campaign thông báo**
```bash
# 1. Tạo danh sách: contacts.txt
cat > contacts.txt << EOF
123456789
234567890
345678901
EOF

# 2. Test trước
npm run bulk --file contacts.txt "New office opening!" --dry-run

# 3. Gửi thực tế
npm run bulk --file contacts.txt "New office opening!" --delay 2
```

---

### **Example 4: Automation + Messaging**
```bash
# Thêm vào automation-master.sh:
# Sau khi sinh báo cáo, gửi tin nhắn

echo "📨 Sending report..."
npm run msg 123456789 "Daily report" \
  --file ~/Zalo Skill/reports/personal_report_*.docx

echo "✅ Sent!"
```

---

## ⚠️ IMPORTANT NOTES

1. **Zalo Login**
   - Phải đăng nhập: `zalo-agent status` → ✓ Logged in
   - Nếu chưa: `zalo-agent login --qr-url`

2. **File Paths**
   - Dùng đường dẫn tuyệt đối: `/Users/trinhhao/file.jpg`
   - Hoặc home dir: `~/file.jpg`
   - Không dùng tương đối: `./file.jpg`

3. **Rate Limiting**
   - Zalo giới hạn tốc độ gửi
   - Dùng --delay 1-2 để gửi chậm
   - Tránh spam (có thể bị khóa tài khoản)

4. **ThreadID vs UserID**
   - ThreadID = conversation ID (dùng cho msg send)
   - UserID = user ID (dùng cho friend add)
   - Trong friend search, thường hiển thị user ID

---

## 🚀 NEXT STEPS

1. **Thử Message Sender:**
   ```bash
   npm run msg <yourFriendId> "Test message"
   ```

2. **Thử Friend Manager:**
   ```bash
   npm run friends list
   npm run friends add <userId> "Hello!"
   ```

3. **Thử Bulk Messenger:**
   ```bash
   npm run bulk --all "Hello everyone!" --dry-run
   ```

4. **Tích hợp vào Automation:**
   ```bash
   # Edit automation-master.sh → thêm messaging commands
   # Chạy: bash ~/Zalo Skill/automation-master.sh
   ```

---

## 📚 FULL DOCUMENTATION

Xem chi tiết tại: `MESSAGING_FEATURES.md`

```bash
# Mở documentation
cat ~/Zalo Skill/MESSAGING_FEATURES.md

# Hoặc view trong editor
nano ~/Zalo Skill/MESSAGING_FEATURES.md
```

---

**Ready to use!** 🎉

```bash
npm run msg <id> "Hello from Zalo!"
npm run friends add <id>
npm run bulk --all "Announcement"
```

Good luck! 🚀
