#!/usr/bin/env node

/**
 * 🤖 Zalo MCP Server v1.0
 * 
 * Model Context Protocol Server cho Zalo
 * - Tích hợp với Claude Code / OpenClaw
 * - 4 tools: get_messages, send_message, list_threads, mark_read
 * - Real-time Zalo integration
 */

import { exec } from 'child_process';
import { promisify } from 'util';

const execPromise = promisify(exec);

// ============================================================
// MCP TOOLS DEFINITION
// ============================================================

const tools = [
  {
    name: "list_threads",
    description: "Lấy danh sách tất cả cuộc trò chuyện (nhóm + cá nhân)",
    inputSchema: {
      type: "object",
      properties: {
        limit: {
          type: "number",
          description: "Số lượng cuộc trò chuyện cần lấy (mặc định: 10)"
        }
      }
    }
  },
  {
    name: "get_messages",
    description: "Lấy tin nhắn từ một cuộc trò chuyện",
    inputSchema: {
      type: "object",
      properties: {
        threadId: {
          type: "string",
          description: "ID của cuộc trò chuyện"
        },
        limit: {
          type: "number",
          description: "Số tin nhắn cần lấy (mặc định: 5)"
        }
      },
      required: ["threadId"]
    }
  },
  {
    name: "send_message",
    description: "Gửi tin nhắn tới một cuộc trò chuyện hoặc nhóm",
    inputSchema: {
      type: "object",
      properties: {
        threadId: {
          type: "string",
          description: "ID của cuộc trò chuyện"
        },
        message: {
          type: "string",
          description: "Nội dung tin nhắn"
        },
        isGroup: {
          type: "boolean",
          description: "Có phải nhóm không (mặc định: false)"
        },
        imagePath: {
          type: "string",
          description: "Đường dẫn ảnh (tùy chọn)"
        }
      },
      required: ["threadId", "message"]
    }
  },
  {
    name: "mark_read",
    description: "Đánh dấu cuộc trò chuyện là đã đọc",
    inputSchema: {
      type: "object",
      properties: {
        threadId: {
          type: "string",
          description: "ID của cuộc trò chuyện"
        }
      },
      required: ["threadId"]
    }
  }
];

// ============================================================
// TOOL IMPLEMENTATIONS
// ============================================================

async function listThreads(limit = 10) {
  try {
    const { stdout } = await execPromise(`zalo-agent conv list --json 2>/dev/null || echo "[]"`);
    let threads = [];
    try {
      threads = JSON.parse(stdout);
    } catch {
      threads = [];
    }
    
    return {
      success: true,
      data: threads.slice(0, limit),
      count: threads.length
    };
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
}

async function getMessages(threadId, limit = 5) {
  try {
    // Lắng nghe tin nhắn từ thread cụ thể
    const { stdout } = await execPromise(
      `zalo-agent listen --json --timeout 5 2>/dev/null | grep '"threadId":"${threadId}"' | head -${limit} || echo "No messages"`
    );
    
    const messages = stdout
      .split('\n')
      .filter(line => line.trim())
      .map(line => {
        try {
          return JSON.parse(line);
        } catch {
          return null;
        }
      })
      .filter(Boolean);
    
    return {
      success: true,
      threadId,
      messages,
      count: messages.length
    };
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
}

async function sendMessage(threadId, message, isGroup = false, imagePath = null) {
  try {
    // Gửi tin nhắn
    const escapedMsg = message.replace(/"/g, '\\"').replace(/\$/g, '\\$');
    const cmd = `zalo-agent msg send ${threadId} "${escapedMsg}"${isGroup ? ' -t 1' : ''}`;
    
    await execPromise(cmd);
    
    // Nếu có ảnh, gửi ảnh
    if (imagePath) {
      await execPromise(`zalo-agent msg send-image ${threadId} "${imagePath}"`);
    }
    
    return {
      success: true,
      threadId,
      message,
      sent: true
    };
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
}

async function markRead(threadId) {
  try {
    // Zalo không có API chính thức để mark read, nhưng có thể log
    return {
      success: true,
      threadId,
      marked: true,
      note: "Zalo không hỗ trợ API mark read chính thức"
    };
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
}

// ============================================================
// MCP PROTOCOL HANDLER
// ============================================================

async function handleToolCall(toolName, toolInput) {
  console.error(`[MCP] Tool: ${toolName}`, toolInput);
  
  switch (toolName) {
    case "list_threads":
      return await listThreads(toolInput.limit || 10);
    
    case "get_messages":
      return await getMessages(toolInput.threadId, toolInput.limit || 5);
    
    case "send_message":
      return await sendMessage(
        toolInput.threadId,
        toolInput.message,
        toolInput.isGroup || false,
        toolInput.imagePath || null
      );
    
    case "mark_read":
      return await markRead(toolInput.threadId);
    
    default:
      return { error: `Unknown tool: ${toolName}` };
  }
}

// ============================================================
// STDIO TRANSPORT (cho Claude Code local)
// ============================================================

async function runStdioServer() {
  const readline = require('readline');
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
  
  console.error('[MCP] Server started (stdio mode)');
  
  rl.on('line', async (line) => {
    try {
      const request = JSON.parse(line);
      let response;
      
      // Handle different request types
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
// HTTP TRANSPORT (cho VPS)
// ============================================================

async function runHttpServer(port, authKey) {
  const http = require('http');
  
  const server = http.createServer(async (req, res) => {
    // CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    
    if (req.method === 'OPTIONS') {
      res.writeHead(200);
      res.end();
      return;
    }
    
    // Check auth
    const auth = req.headers.authorization;
    if (authKey && auth !== `Bearer ${authKey}`) {
      res.writeHead(401, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Unauthorized' }));
      return;
    }
    
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', async () => {
      try {
        const request = JSON.parse(body);
        let response;
        
        if (request.method === 'tools/list') {
          response = { jsonrpc: "2.0", id: request.id, result: { tools } };
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
        
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(response));
      } catch (error) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: error.message }));
      }
    });
  });
  
  server.listen(port, () => {
    console.error(`[MCP] HTTP Server listening on port ${port}`);
    if (authKey) {
      console.error(`[MCP] Auth: Bearer ${authKey}`);
    }
  });
}

// ============================================================
// MAIN
// ============================================================

async function main() {
  console.error('════════════════════════════════════════════════════');
  console.error('🤖 ZALO MCP SERVER v1.0'.padStart(55));
  console.error('════════════════════════════════════════════════════');
  
  const mode = process.argv[2] || 'stdio';
  
  if (mode === 'stdio') {
    console.error('[MCP] Mode: stdio (Claude Code local)');
    console.error('[MCP] Đợi kết nối từ Claude Code...\n');
    await runStdioServer();
  } else if (mode === 'http') {
    const port = process.argv[3] || 3847;
    const authKey = process.argv[4] || null;
    console.error(`[MCP] Mode: HTTP Server`);
    console.error(`[MCP] Port: ${port}`);
    if (authKey) console.error(`[MCP] Auth: Enabled`);
    console.error('[MCP] Khởi động...\n');
    await runHttpServer(port, authKey);
  } else {
    console.error('Usage:');
    console.error('  node mcp-server.js stdio           # For Claude Code local');
    console.error('  node mcp-server.js http 3847 key   # For VPS HTTP');
  }
}

main().catch(console.error);
