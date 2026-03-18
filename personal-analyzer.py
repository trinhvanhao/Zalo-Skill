#!/usr/bin/env python3

"""
🤖 Zalo Personal Messages Analyzer
- Quét TIN NHẮN CÁ NHÂN (không phải nhóm)
- Phân tích nội dung
- Tạo báo cáo chi tiết
- Gửi tới Telegram
"""

import subprocess
import json
import sys
import os
from datetime import datetime
from typing import List, Dict, Any
import re

# ============================================================
# CONFIG
# ============================================================

TELEGRAM_BOT_TOKEN = os.getenv('TELEGRAM_BOT_TOKEN', '')
TELEGRAM_CHAT_ID = os.getenv('TELEGRAM_CHAT_ID', '')

# ============================================================
# ZALO MCP WRAPPER
# ============================================================

class ZaloMCP:
    """Gọi MCP tools để interact với Zalo"""
    
    @staticmethod
    def get_personal_threads() -> List[Dict[str, Any]]:
        """Lấy danh sách cuộc trò chuyện CÁ NHÂN (type=0)"""
        try:
            cmd = "zalo-agent conv recent --json"
            result = subprocess.run(cmd, shell=True, capture_output=True, text=True, timeout=10)
            
            if not result.stdout:
                return []
            
            all_threads = json.loads(result.stdout)
            
            # Lọc chỉ cuộc trò chuyện cá nhân (typeFlag=0 hoặc type='User')
            personal = [t for t in all_threads if t.get('typeFlag') == 0 or t.get('type') == 'User']
            
            return personal
        
        except Exception as e:
            print(f"❌ Lỗi lấy cuộc trò chuyện: {e}")
            return []
    
    @staticmethod
    def get_thread_details(thread_id: str) -> Dict[str, Any]:
        """Lấy chi tiết cuộc trò chuyện"""
        try:
            cmd = "zalo-agent conv recent --json"
            result = subprocess.run(cmd, shell=True, capture_output=True, text=True, timeout=10)
            
            if not result.stdout:
                return {}
            
            all_threads = json.loads(result.stdout)
            return next((t for t in all_threads if t.get('threadId') == thread_id), {})
        
        except Exception as e:
            print(f"❌ Lỗi lấy chi tiết: {e}")
            return {}

# ============================================================
# PERSONAL DATA COLLECTOR
# ============================================================

class PersonalDataCollector:
    """Quét dữ liệu tin nhắn cá nhân"""
    
    @staticmethod
    def collect_personal_messages(limit: int = 20) -> Dict[str, Any]:
        """Quét tin nhắn từ cuộc trò chuyện cá nhân"""
        
        print("📊 Đang quét tin nhắn cá nhân từ Zalo...")
        print("─" * 60)
        
        # Lấy danh sách cuộc trò chuyện cá nhân
        personal_threads = ZaloMCP.get_personal_threads()
        
        if not personal_threads:
            print("❌ Không tìm thấy cuộc trò chuyện cá nhân nào")
            return {"success": False, "error": "No personal threads found"}
        
        print(f"✓ Tìm thấy {len(personal_threads)} cuộc trò chuyện cá nhân")
        
        # Quét từng cuộc trò chuyện
        collected_data = {}
        
        for i, thread in enumerate(personal_threads[:limit], 1):
            thread_id = thread.get('threadId')
            thread_name = thread.get('name', 'Unknown')
            
            print(f"\n[{i}/{min(len(personal_threads), limit)}] {thread_name}")
            
            collected_data[thread_id] = {
                "name": thread_name,
                "threadId": thread_id,
                "type": "personal",
                "typeFlag": thread.get('typeFlag', 0),
                "lastActive": thread.get('lastActive', ''),
                "memberCount": thread.get('memberCount', 1),
            }
            
            print(f"   ✓ Tin chưa đọc: {thread.get('unread', 0)}")
            print(f"   ✓ Tin gần nhất: {thread.get('lastMessage', 'N/A')[:50]}...")
        
        print("\n" + "─" * 60)
        print(f"✅ Quét xong! Tổng {len(collected_data)} cuộc trò chuyện cá nhân")
        
        return {
            "success": True,
            "timestamp": datetime.now().isoformat(),
            "conversationCount": len(collected_data),
            "data": collected_data
        }

# ============================================================
# ANALYSIS ENGINE
# ============================================================

class AnalysisEngine:
    """Phân tích dữ liệu tin nhắn"""
    
    @staticmethod
    def analyze_conversations(data: Dict[str, Any]) -> str:
        """Phân tích và tạo insights"""
        
        conversations = data.get('data', {})
        
        if not conversations:
            return "Không có dữ liệu để phân tích."
        
        # Tính toán stats
        total_conversations = len(conversations)
        
        # Phân loại tin nhắn (tất cả cuộc trò chuyện cá nhân)
        urgent = conversations.values()
        
        analysis = f"""
### 🔍 Phân tích Chi tiết

**Tổng quan:**
- 💬 Cuộc trò chuyện cá nhân: {len(conversations)}

**Danh sách cuộc trò chuyện cá nhân:**
"""
        
        if urgent:
            for i, conv in enumerate(sorted(urgent, key=lambda x: x.get('lastActive', '')), 1):
                analysis += f"\n{i}. **{conv.get('name', 'Unknown')}**"
                if conv.get('lastActive'):
                    analysis += f"\n   > Hoạt động gần nhất: {conv.get('lastActive')}"
        else:
            analysis += "\n- Không có cuộc trò chuyện nào"
        
        # Gợi ý hành động
        analysis += """

### 💡 Gợi ý hành động

1. **Ưu tiên tin chưa đọc** - Xem lại những cuộc trò chuyện có tin chưa đọc
2. **Phản hồi nhanh** - Trả lời những tin nhắn quan trọng
3. **Quản lý tin nhắn** - Dọn dẹp những cuộc trò chuyện cũ

### 📋 Chi tiết cuộc trò chuyện

"""
        
        for i, (thread_id, conv) in enumerate(conversations.items(), 1):
            analysis += f"\n#### {i}. {conv.get('name', 'Unknown')}\n"
            analysis += f"- **Thread ID:** `{thread_id}`\n"
            analysis += f"- **Tin chưa đọc:** {conv.get('unread', 0)}\n"
            if conv.get('lastMessage'):
                analysis += f"- **Tin gần nhất:** {conv.get('lastMessage')[:80]}...\n"
        
        return analysis

# ============================================================
# REPORT GENERATOR
# ============================================================

class ReportGenerator:
    """Tạo báo cáo Markdown"""
    
    @staticmethod
    def generate(data: Dict[str, Any], analysis: str = "") -> str:
        """Tạo báo cáo hoàn chỉnh"""
        
        timestamp = data.get('timestamp', datetime.now().isoformat())
        conv_count = data.get('conversationCount', 0)
        
        report = f"""# 📊 Báo cáo Phân tích Tin Nhắn Zalo Cá Nhân

**📅 Ngày:** {timestamp}
**👤 Loại:** Tin nhắn cá nhân
**💬 Tổng cuộc trò chuyện:** {conv_count}

---

## 📈 Tóm tắt

"""
        
        # Tóm tắt số liệu
        conversations = data.get('data', {})
        
        report += f"""
- **Cuộc trò chuyện cá nhân:** {conv_count}
- **Hoạt động cuối cùng:** [Xem chi tiết bên dưới]

---

## 🔍 Phân tích

{analysis if analysis else "Không có dữ liệu phân tích."}

---

## 📱 Thông tin hệ thống

- **Bot:** Zalo Personal Analyzer
- **Generated at:** {datetime.now().strftime('%d/%m/%Y %H:%M:%S')}
- **Timezone:** Asia/Ho_Chi_Minh

---

*Báo cáo này được tạo tự động bởi Zalo AI Bot*
"""
        
        return report
    
    @staticmethod
    def save(report_content: str, filename: str = None) -> str:
        """Lưu báo cáo"""
        
        if not filename:
            timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
            filename = f"personal_report_{timestamp}.md"
        
        # Tạo thư mục reports
        os.makedirs("reports", exist_ok=True)
        
        filepath = os.path.join("reports", filename)
        
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(report_content)
        
        return filepath

# ============================================================
# TELEGRAM INTEGRATION
# ============================================================

class TelegramNotifier:
    """Gửi báo cáo tới Telegram"""
    
    @staticmethod
    def send_message(message: str) -> bool:
        """Gửi tin nhắn text"""
        
        if not TELEGRAM_BOT_TOKEN or not TELEGRAM_CHAT_ID:
            print("⚠️ Telegram chưa cấu hình (TELEGRAM_BOT_TOKEN, TELEGRAM_CHAT_ID)")
            return False
        
        try:
            import requests
            
            url = f"https://api.telegram.org/bot{TELEGRAM_BOT_TOKEN}/sendMessage"
            payload = {
                "chat_id": TELEGRAM_CHAT_ID,
                "text": message,
                "parse_mode": "HTML"
            }
            
            response = requests.post(url, json=payload, timeout=10)
            
            if response.status_code == 200:
                print("✓ Tin nhắn đã gửi tới Telegram")
                return True
            else:
                print(f"❌ Lỗi Telegram: {response.status_code} - {response.text}")
                return False
        
        except ImportError:
            print("❌ Lỗi: requests library chưa cài. Chạy: pip install requests")
            return False
        except Exception as e:
            print(f"❌ Lỗi gửi Telegram: {e}")
            return False
    
    @staticmethod
    def send_document(filepath: str, caption: str = "") -> bool:
        """Gửi file báo cáo"""
        
        if not TELEGRAM_BOT_TOKEN or not TELEGRAM_CHAT_ID:
            print("⚠️ Telegram chưa cấu hình")
            return False
        
        try:
            import requests
            
            url = f"https://api.telegram.org/bot{TELEGRAM_BOT_TOKEN}/sendDocument"
            
            with open(filepath, 'rb') as f:
                files = {'document': f}
                payload = {
                    "chat_id": TELEGRAM_CHAT_ID,
                    "caption": caption or "📊 Báo cáo Phân tích Zalo",
                    "parse_mode": "HTML"
                }
                
                response = requests.post(url, files=files, data=payload, timeout=10)
            
            if response.status_code == 200:
                print("✓ Báo cáo đã gửi tới Telegram")
                return True
            else:
                print(f"❌ Lỗi Telegram: {response.text}")
                return False
        
        except ImportError:
            print("❌ Lỗi: requests library chưa cài")
            return False
        except Exception as e:
            print(f"❌ Lỗi gửi file: {e}")
            return False

# ============================================================
# MAIN PIPELINE
# ============================================================

def main():
    """Main entry point - Complete pipeline"""
    
    print("\n" + "═" * 60)
    print("🤖 ZALO PERSONAL ANALYZER".center(60))
    print("═" * 60 + "\n")
    
    # Step 1: Quét dữ liệu
    print("📊 STEP 1: Quét dữ liệu tin nhắn cá nhân")
    print("─" * 60)
    
    data = PersonalDataCollector.collect_personal_messages(limit=20)
    
    if not data.get('success'):
        print(f"❌ Lỗi: {data.get('error')}")
        sys.exit(1)
    
    # Step 2: Phân tích
    print("\n🧠 STEP 2: Phân tích dữ liệu")
    print("─" * 60)
    
    analysis = AnalysisEngine.analyze_conversations(data)
    print(analysis[:500] + "..." if len(analysis) > 500 else analysis)
    
    # Step 3: Tạo báo cáo
    print("\n📝 STEP 3: Tạo báo cáo")
    print("─" * 60)
    
    report = ReportGenerator.generate(data, analysis)
    filepath = ReportGenerator.save(report)
    print(f"✓ Báo cáo lưu tại: {filepath}")
    
    # Step 4: Gửi Telegram
    print("\n📱 STEP 4: Gửi báo cáo qua Telegram")
    print("─" * 60)
    
    # Tạo tóm tắt ngắn cho Telegram
    summary = f"""
📊 <b>Báo cáo Phân tích Zalo Cá Nhân</b>

👤 <b>Cuộc trò chuyện:</b> {data.get('conversationCount', 0)}
📬 <b>Tin chưa đọc:</b> {sum(c.get('unread', 0) for c in data.get('data', {}).values())}

🔗 <i>Chi tiết báo cáo đã được lưu</i>
"""
    
    # Gửi tin nhắn tóm tắt
    TelegramNotifier.send_message(summary)
    
    # Gửi file báo cáo
    TelegramNotifier.send_document(filepath, "📊 Báo cáo Phân tích Zalo Cá Nhân")
    
    print("\n" + "═" * 60)
    print("✅ HOÀN THÀNH!".center(60))
    print("═" * 60)
    print(f"\n📁 Báo cáo: {filepath}")
    print("\n💡 Tip: Cấu hình Telegram để nhận báo cáo tự động")
    print("   export TELEGRAM_BOT_TOKEN='your-token'")
    print("   export TELEGRAM_CHAT_ID='your-chat-id'")

if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        print("\n\n⏹️ Bị dừng bởi người dùng")
        sys.exit(0)
    except Exception as e:
        print(f"\n❌ Lỗi: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)
