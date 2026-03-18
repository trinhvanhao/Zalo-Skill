#!/usr/bin/env python3

"""
📨 BULK MESSAGE SENDER
Gửi tin nhắn đến nhiều người hoặc tất cả bạn bè

Usage:
    python3 bulk-messenger.py --all "Xin chào"
    python3 bulk-messenger.py --list user1,user2,user3 "Tin nhắn"
    python3 bulk-messenger.py --file contacts.txt "Tin nhắn"
    python3 bulk-messenger.py --group 123456789 "Tin nhắn nhóm"

Examples:
    python3 bulk-messenger.py --all "Hôm nay thời tiết đẹp lắm"
    python3 bulk-messenger.py --list 111,222,333 "Hẹn gặp cuối tuần"
"""

import subprocess
import sys
import argparse
import time
import json
from pathlib import Path
from datetime import datetime

# Colors
class Colors:
    RED = '\033[91m'
    GREEN = '\033[92m'
    YELLOW = '\033[93m'
    BLUE = '\033[94m'
    MAGENTA = '\033[95m'
    CYAN = '\033[96m'
    WHITE = '\033[97m'
    GRAY = '\033[90m'
    RESET = '\033[0m'

def log(color, *args):
    """Print colored output"""
    print(f"{color}{' '.join(str(a) for a in args)}{Colors.RESET}")

def get_friends_list():
    """Get list of friends using zalo-agent"""
    try:
        result = subprocess.run(
            ['zalo-agent', 'friend', 'list', '--json'],
            capture_output=True,
            text=True,
            check=False
        )
        
        if result.returncode == 0:
            try:
                data = json.loads(result.stdout)
                # Extract friend IDs
                friends = []
                if isinstance(data, list):
                    friends = [f['id'] if isinstance(f, dict) else str(f) for f in data]
                elif isinstance(data, dict) and 'friends' in data:
                    friends = data['friends']
                return friends
            except json.JSONDecodeError:
                # Fallback: parse text output
                log(Colors.YELLOW, "⚠️  JSON parsing failed, using text parser")
                friends = []
                for line in result.stdout.split('\n'):
                    line = line.strip()
                    if line and ('|' in line or '-' in line):
                        parts = line.split('|')
                        if len(parts) > 0:
                            friend_id = parts[0].strip()
                            if friend_id and not friend_id.startswith('-'):
                                friends.append(friend_id)
                return friends
        else:
            log(Colors.RED, f"❌ Error: {result.stderr}")
            return []
    except Exception as e:
        log(Colors.RED, f"❌ Exception: {str(e)}")
        return []

def send_message(thread_id, message, delay=1):
    """Send message to single thread"""
    try:
        cmd = f'zalo-agent msg send "{thread_id}" "{message.replace(chr(34), chr(92)+chr(34))}"'
        result = subprocess.run(
            cmd,
            shell=True,
            capture_output=True,
            text=True,
            check=False
        )
        
        if result.returncode == 0:
            log(Colors.GREEN, f"  ✅ Gửi tới {thread_id}")
            return True
        else:
            log(Colors.RED, f"  ❌ Lỗi {thread_id}: {result.stderr}")
            return False
    except Exception as e:
        log(Colors.RED, f"  ❌ Exception {thread_id}: {str(e)}")
        return False
    finally:
        time.sleep(delay)

def main():
    parser = argparse.ArgumentParser(
        description='Bulk message sender for Zalo',
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  python3 bulk-messenger.py --all "Xin chào mọi người"
  python3 bulk-messenger.py --list 111,222,333 "Tin nhắn"
  python3 bulk-messenger.py --file contacts.txt "Tin nhắn"
  python3 bulk-messenger.py --group 123456789 "Tin nhắn nhóm"
        """
    )
    
    parser.add_argument('message', nargs='?', help='Tin nhắn gửi')
    parser.add_argument('--all', action='store_true', help='Gửi tới tất cả bạn bè')
    parser.add_argument('--list', type=str, help='Danh sách user IDs phân tách bằng dấu phẩy')
    parser.add_argument('--file', type=str, help='File chứa danh sách user IDs (1 ID per line)')
    parser.add_argument('--group', type=str, help='Gửi tới nhóm (thread ID)')
    parser.add_argument('--delay', type=float, default=1, help='Delay giữa các tin nhắn (giây)')
    parser.add_argument('--dry-run', action='store_true', help='Chỉ hiển thị, không gửi')

    args = parser.parse_args()

    # Validation
    if not args.message:
        parser.print_help()
        sys.exit(1)

    if not (args.all or args.list or args.file or args.group):
        log(Colors.RED, "❌ Chỉ định một trong: --all, --list, --file, hoặc --group")
        sys.exit(1)

    # Header
    log(Colors.MAGENTA, "════════════════════════════════════════════")
    log(Colors.MAGENTA, "📨 ZALO BULK MESSAGE SENDER")
    log(Colors.MAGENTA, "════════════════════════════════════════════\n")

    # Get recipients
    recipients = []
    
    if args.group:
        recipients = [args.group]
        log(Colors.CYAN, f"👥 Nhóm: {args.group}")
    elif args.all:
        log(Colors.BLUE, "📱 Đang tải danh sách bạn bè...")
        recipients = get_friends_list()
        log(Colors.CYAN, f"👥 Tổng bạn bè: {len(recipients)}\n")
    elif args.list:
        recipients = [uid.strip() for uid in args.list.split(',')]
        log(Colors.CYAN, f"👥 Danh sách: {len(recipients)} người\n")
    elif args.file:
        try:
            with open(args.file, 'r') as f:
                recipients = [line.strip() for line in f if line.strip()]
            log(Colors.CYAN, f"👥 File: {len(recipients)} người\n")
        except FileNotFoundError:
            log(Colors.RED, f"❌ File không tìm thấy: {args.file}")
            sys.exit(1)

    if not recipients:
        log(Colors.RED, "❌ Không có người nhận")
        sys.exit(1)

    # Show message
    log(Colors.YELLOW, f"📝 Tin nhắn: {args.message}\n")
    log(Colors.YELLOW, f"⏱️  Delay: {args.delay}s\n")

    if args.dry_run:
        log(Colors.YELLOW, "🔍 DRY RUN - Không gửi thực tế\n")
        for i, recipient in enumerate(recipients, 1):
            log(Colors.CYAN, f"  {i}. {recipient}")
        log(Colors.GREEN, f"\n✅ Sẽ gửi {len(recipients)} tin nhắn")
        sys.exit(0)

    # Confirm
    log(Colors.YELLOW, f"⚠️  Chuẩn bị gửi {len(recipients)} tin nhắn")
    response = input(f"{Colors.YELLOW}Tiếp tục? (y/n): {Colors.RESET}").strip().lower()
    
    if response != 'y':
        log(Colors.GRAY, "Đã hủy")
        sys.exit(0)

    log(Colors.BLUE, "\n📨 Đang gửi...\n")

    # Send messages
    success = 0
    failed = 0
    start_time = datetime.now()

    for i, recipient in enumerate(recipients, 1):
        log(Colors.GRAY, f"[{i}/{len(recipients)}]", end=' ')
        if send_message(recipient, args.message, args.delay):
            success += 1
        else:
            failed += 1

    end_time = datetime.now()
    duration = (end_time - start_time).total_seconds()

    # Summary
    log(Colors.MAGENTA, "\n════════════════════════════════════════════")
    log(Colors.GREEN, f"✅ Thành công: {success}/{len(recipients)}")
    if failed > 0:
        log(Colors.RED, f"❌ Thất bại: {failed}/{len(recipients)}")
    log(Colors.CYAN, f"⏱️  Thời gian: {duration:.1f}s")
    log(Colors.MAGENTA, "════════════════════════════════════════════")

    sys.exit(0 if failed == 0 else 1)

if __name__ == '__main__':
    main()
