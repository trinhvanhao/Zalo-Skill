#!/usr/bin/env python3

"""
🤖 Zalo Claude Analyzer
- Tích hợp với Claude Code
- Quét tin nhắn từ Zalo
- Phân tích & tạo báo cáo
"""

import subprocess
import json
import sys
from datetime import datetime
from typing import List, Dict, Any

# ============================================================
# MCP CALL WRAPPER
# ============================================================

class ZaloMCP:
    """Gọi MCP tools để interact với Zalo"""
    
    @staticmethod
    def call_tool(tool_name: str, **kwargs) -> Dict[str, Any]:
        """Gọi MCP tool thông qua zalo-agent"""
        try:
            if tool_name == "list_threads":
                cmd = f"zalo-agent conv list --json"
                result = subprocess.run(cmd, shell=True, capture_output=True, text=True)
                data = json.loads(result.stdout if result.stdout else "[]")
                return {"success": True, "data": data}
            
            elif tool_name == "export_messages":
                threadId = kwargs.get("threadId")
                limit = kwargs.get("limit", 50)
                # Simulate message export - real implementation would use listener
                return {
                    "success": True,
                    "threadId": threadId,
                    "messages": [],
                    "note": "Use listener for live messages"
                }
            
            elif tool_name == "export_group_members":
                threadId = kwargs.get("threadId")
                cmd = f"zalo-agent group members {threadId} --json 2>/dev/null || echo '[]'"
                result = subprocess.run(cmd, shell=True, capture_output=True, text=True)
                data = json.loads(result.stdout if result.stdout else "[]")
                return {"success": True, "members": data}
            
            elif tool_name == "send_message":
                threadId = kwargs.get("threadId")
                message = kwargs.get("message")
                is_group = kwargs.get("isGroup", False)
                
                escaped_msg = message.replace('"', '\\"')
                cmd = f'zalo-agent msg send {threadId} "{escaped_msg}"'
                if is_group:
                    cmd += ' -t 1'
                
                result = subprocess.run(cmd, shell=True, capture_output=True, text=True)
                return {"success": "sent" in result.stdout or result.returncode == 0}
            
            else:
                return {"success": False, "error": f"Unknown tool: {tool_name}"}
        
        except Exception as e:
            return {"success": False, "error": str(e)}

# ============================================================
# DATA COLLECTOR
# ============================================================

class DataCollector:
    """Quét dữ liệu từ Zalo"""
    
    @staticmethod
    def collect_from_threads(thread_ids: List[str] = None, limit: int = 10) -> Dict[str, Any]:
        """Quét dữ liệu từ các nhóm"""
        
        print("📊 Đang quét dữ liệu từ Zalo...")
        print("─" * 60)
        
        # Lấy danh sách nhóm nếu không chỉ định
        if not thread_ids:
            result = ZaloMCP.call_tool("list_threads")
            if result.get("success"):
                threads = result.get("data", [])[:limit]
                thread_ids = [t.get("threadId") for t in threads]
                print(f"✓ Tìm thấy {len(thread_ids)} nhóm")
            else:
                return {"success": False, "error": "Không thể lấy danh sách nhóm"}
        
        # Quét từng nhóm
        collected_data = {}
        
        for i, thread_id in enumerate(thread_ids, 1):
            print(f"\n[{i}/{len(thread_ids)}] Quét nhóm: {thread_id}")
            
            # Lấy thông tin nhóm
            result = ZaloMCP.call_tool("list_threads")
            threads = result.get("data", [])
            thread_info = next((t for t in threads if t.get("threadId") == thread_id), {})
            
            # Lấy thành viên
            members_result = ZaloMCP.call_tool("export_group_members", threadId=thread_id)
            members = members_result.get("members", []) if members_result.get("success") else []
            
            collected_data[thread_id] = {
                "name": thread_info.get("name", "Unknown"),
                "unread": thread_info.get("unread", 0),
                "lastMessage": thread_info.get("lastMessage", ""),
                "memberCount": len(members),
                "members": members[:10]  # Top 10 members
            }
            
            print(f"   ✓ {thread_info.get('name', 'Unknown')} ({len(members)} members)")
        
        print("\n" + "─" * 60)
        print(f"✅ Quét xong! Tổng {len(collected_data)} nhóm")
        
        return {
            "success": True,
            "timestamp": datetime.now().isoformat(),
            "threadCount": len(collected_data),
            "data": collected_data
        }

# ============================================================
# REPORT GENERATOR
# ============================================================

class ReportGenerator:
    """Tạo báo cáo từ dữ liệu"""
    
    @staticmethod
    def generate_markdown(data: Dict[str, Any], analysis: str = "") -> str:
        """Tạo báo cáo Markdown"""
        
        report = f"""# 📊 Báo cáo Phân tích Zalo

**Ngày:** {data.get('timestamp', datetime.now().isoformat())}
**Tổng nhóm:** {data.get('threadCount', 0)}

---

## 📈 Tóm tắt

"""
        
        collected = data.get('data', {})
        
        # Tóm tắt tổng quát
        total_members = sum(d.get('memberCount', 0) for d in collected.values())
        total_unread = sum(d.get('unread', 0) for d in collected.values())
        
        report += f"""
- **Tổng nhóm:** {len(collected)}
- **Tổng thành viên:** {total_members}
- **Tin chưa đọc:** {total_unread}

---

## 📋 Chi tiết nhóm

"""
        
        # Chi tiết từng nhóm
        for i, (thread_id, thread_data) in enumerate(collected.items(), 1):
            report += f"""
### {i}. {thread_data.get('name', 'Unknown')}

| Thông tin | Giá trị |
|----------|--------|
| **Thread ID** | `{thread_id}` |
| **Thành viên** | {thread_data.get('memberCount', 0)} |
| **Tin chưa đọc** | {thread_data.get('unread', 0)} |
| **Tin gần nhất** | {thread_data.get('lastMessage', 'N/A')[:50]}... |

**Thành viên hàng đầu:**
"""
            
            members = thread_data.get('members', [])
            if members:
                for member in members[:5]:
                    report += f"\n- {member.get('name', 'Unknown')}"
            else:
                report += "\n- (Không có thành viên)"
            
            report += "\n"
        
        # Phần phân tích
        if analysis:
            report += f"""
---

## 🔍 Phân tích Chi tiết

{analysis}

"""
        
        # Footer
        report += f"""
---

**Tạo bởi:** Zalo Claude Analyzer
**Thời gian:** {datetime.now().strftime('%d/%m/%Y %H:%M:%S')}
"""
        
        return report
    
    @staticmethod
    def save_report(report_content: str, filename: str = "zalo_report.md") -> str:
        """Lưu báo cáo vào file"""
        
        import os
        
        # Tạo thư mục reports nếu chưa có
        if not os.path.exists("reports"):
            os.makedirs("reports")
        
        filepath = f"reports/{filename}"
        
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(report_content)
        
        return filepath

# ============================================================
# MAIN CLI
# ============================================================

def main():
    """Main entry point"""
    
    print("\n" + "═" * 60)
    print("🤖 ZALO CLAUDE ANALYZER".center(60))
    print("═" * 60 + "\n")
    
    # Quét dữ liệu
    collected = DataCollector.collect_from_threads(limit=10)
    
    if not collected.get("success"):
        print(f"❌ Lỗi: {collected.get('error')}")
        return
    
    # Tạo báo cáo
    print("\n📝 Đang tạo báo cáo...")
    
    analysis_text = """
### 🎯 Insight

Dữ liệu đã được quét thành công từ các nhóm Zalo. 
Báo cáo này chứa:

1. **Danh sách nhóm** - Tất cả nhóm được quét
2. **Thành viên** - Top members trong từng nhóm
3. **Hoạt động** - Tin chưa đọc, tin gần nhất

### 💡 Gợi ý sử dụng

- Sử dụng báo cáo này để theo dõi hoạt động
- Nhận diện nhóm cần chú ý
- Tối ưu hóa quản lý tin nhắn
"""
    
    report = ReportGenerator.generate_markdown(collected, analysis_text)
    
    # Lưu báo cáo
    filename = f"zalo_report_{datetime.now().strftime('%Y%m%d_%H%M%S')}.md"
    filepath = ReportGenerator.save_report(report, filename)
    
    print(f"✅ Báo cáo đã lưu: {filepath}")
    print("\n" + "─" * 60)
    print("\n📖 Nội dung báo cáo:\n")
    print(report)

if __name__ == "__main__":
    try:
        main()
    except Exception as e:
        print(f"❌ Lỗi: {e}")
        sys.exit(1)
