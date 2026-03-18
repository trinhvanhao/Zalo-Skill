#!/usr/bin/env node

/**
 * 🤖 Zalo Advanced MCP Server v2.0
 * 
 * Tích hợp Claude Code để:
 * - Quét tin nhắn từ Zalo
 * - Phân tích dữ liệu
 * - Tạo báo cáo
 */

import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs';
import path from 'path';

const execPromise = promisify(exec);
const writeFile = promisify(fs.writeFile);
const readFile = promisify(fs.readFile);

// ============================================================
// TOOLS DEFINITION
// ============================================================

const tools = [
  {
    name: "list_threads",
    description: "Lấy danh sách tất cả cuộc trò chuyện (nhóm + cá nhân)",
    inputSchema: {
      type: "object",
      properties: {
        limit: { type: "number", description: "Số lượng (mặc định: 10)" }
      }
    }
  },
  {
    name: "get_thread_info",
    description: "Lấy thông tin chi tiết của một nhóm/cuộc trò chuyện",
    inputSchema: {
      type: "object",
      properties: {
        threadId: { type: "string", description: "ID cuộc trò chuyện" }
      },
      required: ["threadId"]
    }
  },
  {
    name: "export_messages",
    description: "Xuất tin nhắn từ cuộc trò chuyện (JSON)",
    inputSchema: {
      type: "object",
      properties: {
        threadId: { type: "string", description: "ID cuộc trò chuyện" },
        limit: { type: "number", description: "Số tin nhắn tối đa (mặc định: 50)" },
        outputPath: { type: "string", description: "Đường dẫn lưu JSON (tùy chọn)" }
      },
      required: ["threadId"]
    }
  },
  {
    name: "export_group_members",
    description: "Lấy danh sách thành viên nhóm",
    inputSchema: {
      type: "object",
      properties: {
        threadId: { type: "string", description: "ID nhóm" }
      },
      required: ["threadId"]
    }
  },
  {
    name: "send_message",
    description: "Gửi tin nhắn tới Zalo",
    inputSchema: {
      type: "object",
      properties: {
        threadId: { type: "string" },
        message: { type: "string" },
        isGroup: { type: "boolean" }
      },
      required: ["threadId", "message"]
    }
  },
  {
    name: "export_report",
    description: "Lưu báo cáo từ Claude vào file",
    inputSchema: {
      type: "object",
      properties: {
        reportContent: { type: "string", description: "Nội dung báo cáo" },
        filename: { type: "string", description: "Tên file (mặc định: report.md)" },
        outputDir: { type: "string", description: "Thư mục lưu (mặc định: ./reports)" }
      },
      required: ["reportContent"]
    }
  }
];

// ============================================================
// TOOL IMPLEMENTATIONS
// ============================================================

async function listThreads(limit = 10) {
  try {
    const { stdout } = await execPromise(`zalo-agent conv list --json 2>/dev/null || echo "[]"`);
    let threads = JSON.parse(stdout);
    
    return {
      success: true,
      count: threads.length,
      threads: threads.slice(0, limit).map(t => ({
        threadId: t.threadId,
        name: t.name,
        unread: t.unread,
        lastMessage: t.lastMessage,
        lastTime: t.lastTime
      }))
    };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

async function getThreadInfo(threadId) {
  try {
    const { stdout: convInfo } = await execPromise(
      `zalo-agent conv list --json | python3 -c "import sys, json; threads = json.load(sys.stdin); print(json.dumps([t for t in threads if t.get('threadId') == '${threadId}'][0] if threads else {}))" 2>/dev/null || echo "{}"`
    );
    
    const info = JSON.parse(convInfo);
    
    return {
      success: true,
      threadId,
      info
    };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

async function exportMessages(threadId, limit = 50, outputPath = null) {
  try {
    // Lắng nghe tin nhắn (simulation - lấy từ history nếu có)
    const messages = [];
    
    // Attempt to get recent messages via listener
    try {
      const { stdout } = await execPromise(
        `timeout 3 zalo-agent listen --json 2>/dev/null | grep '"threadId":"${threadId}"' | head -${limit} || echo ""`,
        { timeout: 5000 }
      );
      
      const lines = stdout.split('\n').filter(l => l.trim());
      for (const line of lines) {
        try {
          messages.push(JSON.parse(line));
        } catch {}
      }
    } catch {}
    
    // Generate report structure
    const report = {
      threadId,
      exportedAt: new Date().toISOString(),
      messageCount: messages.length,
      messages: messages.slice(0, limit).map(m => ({
        event: m.event,
        senderName: m.senderName,
        senderId: m.senderId,
        content: m.content,
        timestamp: m.timestamp,
        type: m.type
      }))
    };
    
    // Lưu file nếu có outputPath
    if (outputPath) {
      await writeFile(outputPath, JSON.stringify(report, null, 2));
    }
    
    return {
      success: true,
      threadId,
      exportedCount: messages.length,
      outputPath: outputPath || null,
      report
    };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

async function exportGroupMembers(threadId) {
  try {
    const { stdout } = await execPromise(
      `zalo-agent group members ${threadId} --json 2>/dev/null || echo "[]"`
    );
    
    let members = [];
    try {
      members = JSON.parse(stdout);
    } catch {}
    
    return {
      success: true,
      threadId,
      memberCount: members.length,
      members: members.slice(0, 50).map(m => ({
        userId: m.userId,
        name: m.name,
        avatar: m.avatar
      }))
    };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

async function sendMessage(threadId, message, isGroup = false) {
  try {
    const escapedMsg = message.replace(/"/g, '\\"').replace(/\$/g, '\\$');
    const cmd = `zalo-agent msg send ${threadId} "${escapedMsg}"${isGroup ? ' -t 1' : ''}`;
    await execPromise(cmd);
    
    return { success: true, threadId, sent: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

async function exportReport(reportContent, filename = 'report.md', outputDir = './reports') {
  try {
    // Tạo thư mục nếu chưa có
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }
    
    const filePath = path.join(outputDir, filename);
    await writeFile(filePath, reportContent, 'utf-8');
    
    return {
      success: true,
      filePath,
      message: `Báo cáo đã lưu: ${filePath}`
    };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// ============================================================
// TOOL HANDLER
// ============================================================

async function handleToolCall(toolName, toolInput) {
  console.error(`[MCP] Tool: ${toolName}`);
  
  switch (toolName) {
    case "list_threads":
      return await listThreads(toolInput.limit || 10);
    
    case "get_thread_info":
      return await getThreadInfo(toolInput.threadId);
    
    case "export_messages":
      return await exportMessages(
        toolInput.threadId,
        toolInput.limit || 50,
        toolInput.outputPath
      );
    
    case "export_group_members":
      return await exportGroupMembers(toolInput.threadId);
    
    case "send_message":
      return await sendMessage(
        toolInput.threadId,
        toolInput.message,
        toolInput.isGroup || false
      );
    
    case "export_report":
      return await exportReport(
        toolInput.reportContent,
        toolInput.filename || 'report.md',
        toolInput.outputDir || './reports'
      );
    
    default:
      return { error: `Unknown tool: ${toolName}` };
  }
}

// ============================================================
// MCP STDIO SERVER
// ============================================================

async function runStdioServer() {
  const readline = require('readline');
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
  
  console.error('[MCP] Advanced Server started (stdio mode)');
  console.error('[MCP] Waiting for Claude Code connection...\n');
  
  rl.on('line', async (line) => {
    try {
      const request = JSON.parse(line);
      let response;
      
      if (request.method === 'tools/list') {
        response = {
          jsonrpc: "2.0",
          id: request.id,
          result: { tools }
        };
      } else if (request.method === 'tools/call') {
        const result = await handleToolCall(request.params.name, request.params.arguments);
        response = {
          jsonrpc: "2.0",
          id: request.id,
          result: { content: [{ type: "text", text: JSON.stringify(result) }] }
        };
      } else {
        response = {
          jsonrpc: "2.0",
          id: request.id,
          error: { code: -32601, message: "Method not found" }
        };
      }
      
      console.log(JSON.stringify(response));
    } catch (error) {
      console.error('[MCP Error]', error.message);
    }
  });
}

// ============================================================
// MAIN
// ============================================================

async function main() {
  console.error('════════════════════════════════════════════════════');
  console.error('🤖 ZALO ADVANCED MCP SERVER v2.0'.padStart(55));
  console.error('════════════════════════════════════════════════════');
  console.error('');
  console.error('✨ NEW Tools:');
  console.error('   • export_messages - Xuất tin nhắn (JSON)');
  console.error('   • export_group_members - Danh sách thành viên');
  console.error('   • export_report - Lưu báo cáo');
  console.error('   • get_thread_info - Thông tin chi tiết');
  console.error('');
  
  const mode = process.argv[2] || 'stdio';
  
  if (mode === 'stdio') {
    console.error('[MCP] Mode: stdio (Claude Code integration)');
    console.error('[MCP] Để sử dụng:');
    console.error('   1. Mở Claude Code terminal');
    console.error('   2. Chạy: node ~/zalo-ai-bot/mcp-advanced.js');
    console.error('   3. Trong Claude Code: @zalo list_threads');
    console.error('');
    await runStdioServer();
  }
}

main().catch(console.error);
