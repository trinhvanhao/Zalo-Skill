# 📨 ZALO MESSAGING FEATURES

**Version:** 1.0  
**Updated:** 2026-03-19  
**Status:** ✅ FULLY OPERATIONAL

---

## 📑 TABLE OF CONTENTS

1. [Message Sender (Gửi Tin Nhắn)](#1-message-sender)
2. [Friend Manager (Quản Lý Bạn Bè)](#2-friend-manager)
3. [Bulk Messenger (Gửi Tin Nhắn Hàng Loạt)](#3-bulk-messenger)
4. [Integration Examples](#4-integration-examples)

---

## 1. MESSAGE SENDER - Gửi Tin Nhắn Cá Nhân

### 📌 Mục Đích
Gửi tin nhắn, ảnh, file, hoặc link tới một người hoặc nhóm cụ thể

### 🎯 Cách Sử Dụng

#### ✨ **MỚI: Gửi bằng tên liên hệ (tự động tìm ID)**

```bash
# Gửi bằng tên - EASY! ✅
npm run msg "Hào" "Nội dung tin nhắn"
npm run msg "San Thật Chất" "Tin nhắn"
npm run msg "Trig" "Hello!"
```

#### 📌 **Hoặc gửi bằng ID (nếu biết)**

```bash
npm run msg 8672767095770686387 "Nội dung tin nhắn"
npm run msg 123456789 "Hello!"
```

**Lấy Thread ID (nếu cần):**
```bash
# Cách 1: Tìm bạn theo tên
zalo-agent friend search "Hào"
# Output: 8672767095770686387  Hào

# Cách 2: Danh sách bạn bè
zalo-agent friend list

# Cách 3: Tìm theo SĐT
zalo-agent friend find "0902123456"
```

### 📊 CÁC LOẠI TIN NHẮN

#### 1️⃣ **Gửi Tin Nhắn Text**

```bash
# Gửi bằng tên (MỚI!)
npm run msg "Hào" "Nội dung tin nhắn"

# Hoặc bằng ID
npm run msg 8672767095770686387 "Nội dung tin nhắn"
```

**Ví dụ:**
```bash
npm run msg "Hào" "Xin chào, bạn khỏe không?"
npm run msg "San Thật Chất" "Hôm nay thời tiết đẹp lắm"
npm run msg 987654321 "Hello World!"
```

---

#### 2️⃣ **Gửi Ảnh + Tin Nhắn**

```bash
# Gửi bằng tên (MỚI!)
npm run msg "Hào" "Mô tả ảnh" --image ~/Documents/photo.jpg

# Hoặc bằng ID
npm run msg 8672767095770686387 "Mô tả ảnh" --image ~/Documents/photo.jpg
```

**Ví dụ:**
```bash
npm run msg "Hào" "Xem ảnh này" --image ~/Documents/photo.jpg
npm run msg "San Thật Chất" "Báo cáo" --image ~/reports/report.png
npm run msg 987654321 "Ảnh đẹp" --image ~/Pictures/sunset.jpg
```

**Kết quả:**
- 📸 Gửi ảnh trước
- 📝 Gửi text sau

---

#### 3️⃣ **Gửi File**

```bash
# Gửi bằng tên (MỚI!)
npm run msg "Hào" "Mô tả file" --file ~/reports.docx

# Hoặc bằng ID
npm run msg 8672767095770686387 "Báo cáo" --file ~/reports.docx
```

**Ví dụ:**
```bash
npm run msg "Hào" "Báo cáo đầu tháng" --file ~/reports.docx
npm run msg "San Thật Chất" "Bảng tính" --file ~/data.xlsx
npm run msg 987654321 "Hóa đơn" --file ~/invoice.pdf
```

**Được hỗ trợ:**
- 📄 .docx, .doc, .pdf, .txt
- 📊 .xlsx, .xls, .csv
- 🔗 .zip, .rar, .7z (nén)
- 🎵 .mp3, .wav, .m4a (âm thanh)
- 🎬 .mp4, .mov (video)

---

#### 4️⃣ **Gửi Link**

```bash
# Gửi bằng tên (MỚI!)
npm run msg "Hào" "Mô tả link" --link https://example.com

# Hoặc bằng ID
npm run msg 8672767095770686387 "Link" --link https://example.com
```

**Ví dụ:**
```bash
npm run msg 123456789 "Xem bài viết này" --link https://example.com/article
npm run msg 987654321 "Video hay" --link https://youtube.com/watch?v=xxx
```

**Kết quả:**
- 🔗 Link được preview tự động
- 🖼️ Hiển thị title, description, thumbnail

---

#### 5️⃣ **Gửi Voice Message (Tin Tức)**

```bash
npm run msg <threadId> "Ghi chú" --voice https://example.com/voice.mp3
```

**Ví dụ:**
```bash
npm run msg 123456789 "Tin nhắn thoại" --voice https://example.com/msg.mp3
```

---

### 🔍 TÌM THREAD ID

**Cách 1: Tìm bạn theo tên**
```bash
zalo-agent friend search "Hào"
# Output:
# ID: 123456789
# Name: Hào
# Status: Friend
```

**Cách 2: Danh sách tất cả bạn**
```bash
zalo-agent friend list
# Hiển thị tất cả bạn và thread ID của họ
```

**Cách 3: Tìm theo SĐT hoặc Zalo ID**
```bash
zalo-agent friend find "0902123456"
zalo-agent friend find-username "username123"
```

---

### 💡 VÍ DỤ THỰC TÍNH

```bash
# Gửi tin nhắn chúc mừng
npm run msg 123456789 "Chúc bạn sinh nhật vui vẻ! 🎉"

# Gửi báo cáo với file
npm run msg 123456789 "Báo cáo hôm nay" --file ~/monthly-report.docx

# Gửi hình với lời nhắn
npm run msg 123456789 "Ảnh lúc dã ngoại" --image ~/trip-photo.jpg

# Chia sẻ link bài viết
npm run msg 123456789 "Bài viết hay lắm" --link https://news.example.com/article

# Gửi âm thanh tự động
npm run msg 123456789 "Lời nhắn thoại" --voice https://tts.example.com/voice.mp3
```

---

## 2. FRIEND MANAGER - Quản Lý Bạn Bè

### 📌 Mục Đích
Quản lý bạn bè, gửi lời mời kết bạn, chặn/bỏ chặn, tìm kiếm

### 🎯 Cách Sử Dụng

```bash
npm run friends <command> [args]
# hoặc
node friend-manager.js <command> [args]
```

---

### 📊 CÁC LỆNH

#### 1️⃣ **Xem Danh Sách Bạn Bè**

```bash
npm run friends list
```

**Output:**
```
👥 Danh sách bạn bè:
ID: 123456789 | Name: Hào | Status: Friend
ID: 987654321 | Name: Minh | Status: Friend
ID: 555555555 | Name: Phương | Status: Friend
...
```

---

#### 2️⃣ **Tìm Bạn Theo Tên**

```bash
npm run friends search "Hào"
```

**Output:**
```
ID: 123456789
Name: Hào
Status: Friend
Last Online: 5 minutes ago
```

---

#### 3️⃣ **Gửi Lời Mời Kết Bạn (CHÍNH)**

```bash
npm run friends add <userId> [optional message]
```

**Ví dụ:**
```bash
# Gửi lời mời kết bạn đơn giản
npm run friends add 123456789

# Gửi lời mời kết bạn với lời nhắn
npm run friends add 123456789 "Hãy kết bạn với mình"

# Hoặc dùng node trực tiếp
node friend-manager.js add 123456789 "Chào bạn"
```

**Lưu ý:**
- ✅ Gửi lời mời tới người chưa phải bạn
- ⏳ Chờ họ chấp nhận
- 📝 Có thể kèm lời nhắn

---

#### 4️⃣ **Tìm Người Dùng (Theo SĐT hoặc Zalo ID)**

```bash
npm run friends find "0902123456"
npm run friends find "username123"
```

**Output:**
```
ID: 123456789
Name: Hào
Phone: 0902123456
Bio: Developer
```

---

#### 5️⃣ **Xem Thông Tin Bạn**

```bash
npm run friends info 123456789
```

**Output:**
```
Name: Hào
ID: 123456789
Phone: 0902123456
Bio: Developer
Status: Online now
Last Seen: Just now
```

---

#### 6️⃣ **Bạn Đang Online**

```bash
npm run friends online
```

**Output:**
```
📱 Bạn đang online:
✓ Hào (5 phút trước)
✓ Minh (2 phút trước)
✓ Phương (vừa xong)
...
```

---

#### 7️⃣ **Chấp Nhận Lời Mời Kết Bạn**

```bash
npm run friends accept 123456789
```

---

#### 8️⃣ **Xóa Bạn**

```bash
npm run friends remove 123456789
```

⚠️ **Cảnh báo:** Hành động này không thể hoàn tác!

---

#### 9️⃣ **Chặn Người Dùng**

```bash
npm run friends block 123456789
```

**Kết quả:** Người đó không thể liên hệ bạn

---

#### 🔟 **Bỏ Chặn**

```bash
npm run friends unblock 123456789
```

---

#### 1️⃣1️⃣ **Đặt Biệt Danh (Nickname)**

```bash
npm run friends alias <userId> "Tên biệt danh"
```

**Ví dụ:**
```bash
npm run friends alias 123456789 "Hào Hào"
npm run friends alias 987654321 "Minh Minh"
```

**Kết quả:**
- 📝 Đặt biệt danh để nhận dạng dễ hơn
- 🏷️ Chỉ bạn thấy được biệt danh này

---

#### 1️⃣2️⃣ **Lời Mời Kết Bạn Chờ Xử Lý**

```bash
npm run friends requests
```

**Output:**
```
📥 Lời mời chờ xử lý:
1. Hào - Gửi lời mời 2 giờ trước
2. Minh - Gửi lời mời hôm qua
...
```

---

### 💡 VÍ DỤ THỰC TÍNH

```bash
# Gửi lời mời kết bạn
npm run friends add 123456789

# Gửi lời mời với lời nhắn
npm run friends add 123456789 "Hãy kết bạn để nhắn tin nhé"

# Chấp nhận lời mời
npm run friends accept 987654321

# Tìm bạn cũ
npm run friends search "Hào"

# Xem thông tin chi tiết
npm run friends info 123456789

# Đặt biệt danh
npm run friends alias 123456789 "Hào Anh"

# Kiểm tra ai online
npm run friends online

# Xem lời mời chờ xử lý
npm run friends requests
```

---

## 3. BULK MESSENGER - Gửi Tin Nhắn Hàng Loạt

### 📌 Mục Đích
Gửi tin nhắn tới nhiều người cùng một lúc

### 🎯 Cách Sử Dụng

```bash
npm run bulk "Nội dung tin nhắn" [options]
# hoặc
python3 bulk-messenger.py "Nội dung tin nhắn" [options]
```

---

### 📊 CÁC OPTION

#### 1️⃣ **Gửi Tới Tất Cả Bạn Bè**

```bash
npm run bulk --all "Xin chào mọi người!"
```

**Quá trình:**
1. ✅ Tải danh sách tất cả bạn bè
2. ✅ Hiển thị số lượng
3. ❓ Xác nhận trước khi gửi
4. 📨 Gửi từng cái một

---

#### 2️⃣ **Gửi Tới Danh Sách User ID**

```bash
npm run bulk --list 111111111,222222222,333333333 "Tin nhắn"
```

**Ví dụ:**
```bash
npm run bulk --list 123456789,987654321 "Hôm nay họp lúc 3 giờ"
```

---

#### 3️⃣ **Gửi Từ File Danh Sách**

**Tạo file `contacts.txt`:**
```
123456789
987654321
555555555
777777777
```

**Gửi:**
```bash
npm run bulk --file contacts.txt "Tin nhắn quan trọng"
```

---

#### 4️⃣ **Gửi Tới Nhóm**

```bash
npm run bulk --group 123456789 "Thông báo cho nhóm"
```

---

### 🎛️ TUỲ CHỌN THÊM

```bash
npm run bulk "Tin nhắn" --all \
  --delay 2 \
  --dry-run

# --delay 2        : Chờ 2 giây giữa mỗi tin nhắn
# --dry-run        : Chỉ hiển thị, không gửi thực tế
```

---

### 💡 VÍ DỤ THỰC TÍNH

```bash
# Gửi thông báo tới tất cả bạn
npm run bulk --all "Lễ 30/4 vui vẻ!"

# Gửi danh sách cụ thể
npm run bulk --list 111,222,333 "Cuộc họp hôm nay lúc 14:00"

# Gửi từ file
npm run bulk --file team.txt "Kết quả dự án"

# Test (không gửi thực tế)
npm run bulk --all "Test message" --dry-run

# Gửi chậm (tránh spam)
npm run bulk --all "Announcement" --delay 3
```

---

### ⚠️ LƯU Ý QUAN TRỌNG

- ✅ Luôn kiểm tra preview trước khi gửi
- ✅ Gửi chậm (--delay 1-2s) tránh bị khóa tài khoản
- ✅ Không gửi tin nhắn spam/quảng cáo
- ✅ Dùng --dry-run để test trước
- ⚠️ Zalo có giới hạn tốc độ gửi

---

## 4. INTEGRATION EXAMPLES

### 📌 VÍ DỤ KẾT HỢP

#### **Workflow 1: Gửi Báo Cáo Hàng Ngày**

```bash
#!/bin/bash
# Gửi báo cáo hàng ngày qua Zalo

# 1. Sinh báo cáo
python3 ~/Zalo Skill/generate_financial_report.py 30

# 2. Gửi cho các người quản lý
npm run msg 123456789 "Báo cáo tài chính tháng 3" \
  --file ~/reports/financial_report.xlsx

npm run msg 987654321 "Báo cáo tài chính tháng 3" \
  --file ~/reports/financial_report.xlsx

# 3. Thông báo nhóm
npm run bulk --group 555555555 "Báo cáo hôm nay đã gửi"
```

**Chạy via cron:**
```bash
# Mỗi sáng 09:00
0 9 * * * /Users/trinhhao/Zalo Skill/daily-report.sh
```

---

#### **Workflow 2: Kết Bạn & Gửi Welcome Message**

```bash
#!/bin/bash
# Gửi lời mời kết bạn + welcome message

# 1. Gửi lời mời kết bạn
npm run friends add 123456789 "Hãy kết bạn để nhắn tin"

# 2. Chờ 5 giây
sleep 5

# 3. Gửi welcome message
npm run msg 123456789 "Chào bạn! Rất vui được kết bạn 😊"

# 4. Gửi file hoặc link hữu ích
npm run msg 123456789 "Đây là hướng dẫn sử dụng" \
  --file ~/instructions.pdf
```

---

#### **Workflow 3: Campaign Thông Báo**

```bash
#!/bin/bash
# Thông báo sự kiện cho tất cả bạn bè

# 1. Chuẩn bị danh sách bạn bè
zalo-agent friend list > team_members.txt

# 2. Gửi thông báo sự kiện
npm run bulk --file team_members.txt \
  "🎉 Chúng tôi mở VP mới! Mời bạn tham dự 🎉" \
  --delay 2

# 3. Gửi ảnh sự kiện sau
sleep 30
npm run bulk --file team_members.txt \
  "Xem ảnh VP mới" \
  --image ~/office-photo.jpg \
  --delay 2
```

---

#### **Workflow 4: Auto-Add Bạn Mới**

```bash
#!/bin/bash
# Tự động add bạn từ danh sách

CONTACT_FILE="new_contacts.txt"

while IFS= read -r userId; do
  echo "Adding $userId..."
  npm run friends add "$userId" "Hãy kết bạn với mình"
  sleep 2
done < "$CONTACT_FILE"

echo "✅ Tất cả lời mời đã gửi!"
```

---

### 📚 KẾT HỢP VỚI AUTOMATION

**Thêm vào `automation-master.sh`:**

```bash
# Phần gửi báo cáo hàng ngày
echo "📨 Gửi báo cáo qua Zalo..."
npm run msg 123456789 "Báo cáo hôm nay" \
  --file ~/Zalo Skill/reports/personal_report_*.docx

echo "✅ Báo cáo đã gửi!"
```

---

### 🔗 KẾT HỢP VỚI BOT AUTO-REPLY

**Auto-reply + Message Sender:**

```javascript
// Trong bot.js, khi nhận tin nhắn đặc biệt:
if (message.includes("gửi báo cáo")) {
  // 1. Sinh báo cáo
  exec("python3 personal-docx-analyzer.py");
  
  // 2. Gửi lại
  exec("npm run msg " + threadId + " 'Báo cáo đây' --file reports/latest.docx");
}
```

---

## 🚀 QUICK COMMAND REFERENCE

```bash
# ==================== MESSAGE SENDER ====================
npm run msg <id> "Text"                    # Gửi text
npm run msg <id> "Text" --image photo.jpg  # Gửi ảnh
npm run msg <id> "Text" --file report.pdf  # Gửi file
npm run msg <id> "Text" --link https://... # Gửi link

# ==================== FRIEND MANAGER ====================
npm run friends list                        # Danh sách bạn
npm run friends search "Name"               # Tìm bạn
npm run friends add 123456789               # Gửi lời mời kết bạn
npm run friends add 123456789 "Hello"       # Kết bạn + message
npm run friends online                      # Bạn online
npm run friends info 123456789              # Xem thông tin
npm run friends alias 123456789 "Nickname" # Đặt biệt danh
npm run friends block 123456789             # Chặn
npm run friends requests                    # Lời mời chờ

# ==================== BULK MESSENGER ====================
npm run bulk --all "Message"                # Gửi tất cả
npm run bulk --list 111,222,333 "Message"  # Gửi danh sách
npm run bulk --file contacts.txt "Message" # Gửi từ file
npm run bulk --group 123456789 "Message"    # Gửi nhóm
npm run bulk --all "Message" --dry-run      # Test trước
npm run bulk --all "Message" --delay 2      # Chậm 2 giây
```

---

## 📞 TROUBLESHOOTING

### ❌ "Lỗi: Thread ID không hợp lệ"
```bash
# Kiểm tra thread ID đúng
zalo-agent friend search "Hào"
# Copy đúng ID
npm run msg 123456789 "Test"
```

### ❌ "Lỗi: Zalo not logged in"
```bash
# Đăng nhập lại
zalo-agent login --qr-url
# Rồi chạy lại
npm run msg ...
```

### ❌ "Timeout khi gửi bulk"
```bash
# Tăng delay
npm run bulk --all "Message" --delay 3

# Hoặc test trước
npm run bulk --all "Message" --dry-run
```

### ❌ "File not found"
```bash
# Dùng đường dẫn tuyệt đối
npm run msg 123456789 "Photo" --image /Users/trinhhao/photo.jpg

# Hoặc từ home directory
npm run msg 123456789 "Photo" --image ~/Documents/photo.jpg
```

---

**Created:** 2026-03-19  
**Status:** ✅ COMPLETE  
**Last Updated:** 2026-03-19 02:30 GMT+7
