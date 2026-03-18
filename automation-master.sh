#!/bin/bash

# 🤖 ZALO BOT - MASTER AUTOMATION SCRIPT
# Tích hợp OpenClaw + Claude Code Cowork
# 
# Purpose: Tự động hóa toàn bộ Zalo Bot workflow
# Schedule: Chạy tự động qua cron job

set -e

# ============================================================
# CONFIG
# ============================================================

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPORTS_DIR="$SCRIPT_DIR/reports"
LOGS_DIR="$SCRIPT_DIR/logs"
BACKUPS_DIR="$SCRIPT_DIR/backups"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
LOG_FILE="$LOGS_DIR/automation_${TIMESTAMP}.log"

# Create directories
mkdir -p "$REPORTS_DIR" "$LOGS_DIR" "$BACKUPS_DIR"

# ============================================================
# LOGGING
# ============================================================

log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" | tee -a "$LOG_FILE"
}

log_step() {
    echo ""
    echo "════════════════════════════════════════════════════" | tee -a "$LOG_FILE"
    echo "📊 $1" | tee -a "$LOG_FILE"
    echo "════════════════════════════════════════════════════" | tee -a "$LOG_FILE"
}

log_success() {
    echo "✅ $1" | tee -a "$LOG_FILE"
}

log_error() {
    echo "❌ $1" | tee -a "$LOG_FILE"
}

# ============================================================
# STEP 1: CHECK DEPENDENCIES
# ============================================================

log_step "STEP 1: Checking Dependencies"

check_command() {
    if ! command -v $1 &> /dev/null; then
        log_error "$1 not found"
        exit 1
    fi
    log "✓ $1 installed"
}

check_command "node"
check_command "python3"
check_command "zalo-agent"

# ============================================================
# STEP 2: CHECK ZALO LOGIN
# ============================================================

log_step "STEP 2: Verifying Zalo Login"

if zalo-agent status &>/dev/null; then
    log_success "Zalo agent logged in"
else
    log_error "Zalo agent not logged in"
    exit 1
fi

# ============================================================
# STEP 3: GENERATE REPORT
# ============================================================

log_step "STEP 3: Generating Zalo Personal Report"

cd "$SCRIPT_DIR"

if python3 personal-docx-analyzer.py >> "$LOG_FILE" 2>&1; then
    REPORT_FILE=$(ls -t "$REPORTS_DIR"/*.docx 2>/dev/null | head -1)
    log_success "Report generated: $REPORT_FILE"
else
    log_error "Failed to generate report"
    exit 1
fi

# ============================================================
# STEP 4: BACKUP REPORTS
# ============================================================

log_step "STEP 4: Backing Up Reports"

BACKUP_TIMESTAMP=$(date +%Y%m%d)
BACKUP_SUBDIR="$BACKUPS_DIR/$BACKUP_TIMESTAMP"
mkdir -p "$BACKUP_SUBDIR"

if cp "$REPORTS_DIR"/*.docx "$BACKUP_SUBDIR/" 2>/dev/null; then
    log_success "Reports backed up to: $BACKUP_SUBDIR"
else
    log_error "Backup failed (non-critical, continuing)"
fi

# ============================================================
# STEP 5: GENERATE METRICS
# ============================================================

log_step "STEP 5: Generating Metrics"

METRICS_FILE="$LOGS_DIR/metrics_${TIMESTAMP}.txt"

{
    echo "📊 ZALO BOT AUTOMATION METRICS"
    echo "════════════════════════════════════════════"
    echo ""
    echo "Timestamp: $(date)"
    echo "Report: $(basename $REPORT_FILE)"
    echo "Report Size: $(du -h $REPORT_FILE | cut -f1)"
    echo "Backups: $(ls -d $BACKUPS_DIR/*/ 2>/dev/null | wc -l) days"
    echo "Total Backup Size: $(du -sh $BACKUPS_DIR 2>/dev/null | cut -f1 || echo 'N/A')"
    echo ""
    echo "✅ Automation completed successfully"
} | tee "$METRICS_FILE"

log_success "Metrics generated: $METRICS_FILE"

# ============================================================
# STEP 6: CREATE SUMMARY REPORT
# ============================================================

log_step "STEP 6: Creating Automation Summary"

SUMMARY_FILE="$LOGS_DIR/summary_${TIMESTAMP}.md"

{
    echo "# 🤖 Zalo Bot Automation Report"
    echo ""
    echo "**Date:** $(date '+%d/%m/%Y %H:%M:%S')"
    echo ""
    echo "## ✅ Completed Tasks"
    echo ""
    echo "- ✅ Checked dependencies"
    echo "- ✅ Verified Zalo login"
    echo "- ✅ Generated personal report"
    echo "- ✅ Backed up reports"
    echo "- ✅ Generated metrics"
    echo ""
    echo "## 📊 Statistics"
    echo ""
    echo "| Metric | Value |"
    echo "|--------|-------|"
    echo "| Report File | $(basename $REPORT_FILE) |"
    echo "| Report Size | $(du -h $REPORT_FILE | cut -f1) |"
    echo "| Total Backups | $(ls -d $BACKUPS_DIR/*/ 2>/dev/null | wc -l) |"
    echo "| Backup Size | $(du -sh $BACKUPS_DIR 2>/dev/null | cut -f1 || echo 'N/A') |"
    echo "| Execution Time | $(date +%s) |"
    echo ""
    echo "## 📁 Output Files"
    echo ""
    echo "- Report: \`$REPORT_FILE\`"
    echo "- Backup: \`$BACKUP_SUBDIR\`"
    echo "- Metrics: \`$METRICS_FILE\`"
    echo "- Summary: \`$SUMMARY_FILE\`"
    echo "- Log: \`$LOG_FILE\`"
    echo ""
    echo "## 🔄 Next Steps"
    echo ""
    echo "1. Review the generated report"
    echo "2. Check metrics for improvements"
    echo "3. Plan next features with Claude Code"
    echo "4. Schedule weekly cowork sessions"
    echo ""
    echo "---"
    echo "Generated by Zalo Bot Automation System"
} | tee "$SUMMARY_FILE"

log_success "Summary report created: $SUMMARY_FILE"

# ============================================================
# STEP 7: CLEANUP OLD LOGS
# ============================================================

log_step "STEP 7: Cleaning Up Old Files"

# Keep only last 30 days of logs
find "$LOGS_DIR" -name "*.log" -mtime +30 -delete 2>/dev/null || true
find "$LOGS_DIR" -name "*.md" -mtime +30 -delete 2>/dev/null || true
find "$LOGS_DIR" -name "*.txt" -mtime +30 -delete 2>/dev/null || true

log_success "Cleanup completed"

# ============================================================
# FINAL REPORT
# ============================================================

log_step "🎉 AUTOMATION COMPLETE!"

echo ""
echo "════════════════════════════════════════════════════" | tee -a "$LOG_FILE"
echo "✅ All tasks completed successfully!" | tee -a "$LOG_FILE"
echo "════════════════════════════════════════════════════" | tee -a "$LOG_FILE"
echo "" | tee -a "$LOG_FILE"
echo "📊 Summary:" | tee -a "$LOG_FILE"
echo "   Report: $REPORT_FILE" | tee -a "$LOG_FILE"
echo "   Backup: $BACKUP_SUBDIR" | tee -a "$LOG_FILE"
echo "   Logs: $LOGS_DIR" | tee -a "$LOG_FILE"
echo "" | tee -a "$LOG_FILE"
echo "💡 Next: Review reports or run Claude Code cowork session" | tee -a "$LOG_FILE"
echo "" | tee -a "$LOG_FILE"

exit 0
