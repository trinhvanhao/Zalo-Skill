#!/bin/bash

# 🤖 ZALO BOT - CRON SETUP SCRIPT
# Setup automated jobs for OpenClaw

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
MASTER_SCRIPT="$SCRIPT_DIR/automation-master.sh"

echo "════════════════════════════════════════════════════"
echo "🤖 ZALO BOT - CRON JOB SETUP"
echo "════════════════════════════════════════════════════"
echo ""

# Check if script exists
if [ ! -f "$MASTER_SCRIPT" ]; then
    echo "❌ Master script not found: $MASTER_SCRIPT"
    exit 1
fi

echo "✓ Master script found: $MASTER_SCRIPT"
echo ""

# Create temporary crontab file
TEMP_CRON=$(mktemp)
trap "rm -f $TEMP_CRON" EXIT

# Export current crontab
crontab -l > "$TEMP_CRON" 2>/dev/null || true

# Check if jobs already exist
if grep -q "$MASTER_SCRIPT" "$TEMP_CRON"; then
    echo "⚠️  Cron jobs already configured"
    echo ""
    echo "Current cron jobs:"
    grep "$MASTER_SCRIPT" "$TEMP_CRON" || true
    echo ""
    read -p "Replace with new config? (y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "❌ Setup cancelled"
        exit 0
    fi
    # Remove old jobs
    grep -v "$MASTER_SCRIPT" "$TEMP_CRON" > "$TEMP_CRON.new"
    mv "$TEMP_CRON.new" "$TEMP_CRON"
fi

echo "📝 Adding cron jobs..."
echo ""

# Add new jobs
{
    echo ""
    echo "# ════════════════════════════════════════════════════"
    echo "# 🤖 ZALO BOT AUTOMATION JOBS"
    echo "# Auto-generated on $(date)"
    echo "# ════════════════════════════════════════════════════"
    echo ""
    echo "# Daily Report at 09:00 AM"
    echo "0 9 * * * $MASTER_SCRIPT >> /tmp/zalo-automation.log 2>&1"
    echo ""
    echo "# Weekly Report on Monday at 09:00 AM"
    echo "0 9 * * 1 $MASTER_SCRIPT >> /tmp/zalo-automation-weekly.log 2>&1"
    echo ""
    echo "# Check Zalo status daily at 06:00 AM"
    echo "0 6 * * * zalo-agent status >> /tmp/zalo-status.log 2>&1"
    echo ""
    echo "# Cleanup old logs (keep 30 days) on Sunday 02:00 AM"
    echo "0 2 * * 0 find $SCRIPT_DIR/logs -type f -mtime +30 -delete"
    echo ""
} >> "$TEMP_CRON"

# Install new crontab
crontab "$TEMP_CRON"

echo "✅ Cron jobs installed successfully!"
echo ""
echo "════════════════════════════════════════════════════"
echo "📋 CONFIGURED JOBS:"
echo "════════════════════════════════════════════════════"
echo ""
echo "1️⃣  Daily Automation (09:00 AM)"
echo "   Command: $MASTER_SCRIPT"
echo "   Log: /tmp/zalo-automation.log"
echo ""
echo "2️⃣  Weekly Report (Monday 09:00 AM)"
echo "   Command: $MASTER_SCRIPT"
echo "   Log: /tmp/zalo-automation-weekly.log"
echo ""
echo "3️⃣  Status Check (06:00 AM daily)"
echo "   Command: zalo-agent status"
echo "   Log: /tmp/zalo-status.log"
echo ""
echo "4️⃣  Cleanup Old Logs (Sunday 02:00 AM)"
echo "   Keeps only last 30 days of logs"
echo ""
echo "════════════════════════════════════════════════════"
echo ""
echo "💡 View all jobs:"
echo "   crontab -l"
echo ""
echo "💡 View logs:"
echo "   tail -f /tmp/zalo-automation.log"
echo ""
echo "💡 Edit jobs:"
echo "   crontab -e"
echo ""
echo "✅ Setup complete!"
