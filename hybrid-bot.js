#!/usr/bin/env node

/**
 * 🤖 Zalo Hybrid Bot v1.0
 * 
 * Kết hợp:
 * - MCP Server (tools cho Claude Code)
 * - AI Auto-reply (Gemini)
 * - Real-time Zalo
 */

import dotenv from 'dotenv';
import axios from 'axios';
import { exec } from 'child_process';
import { promisify } from 'util';
import http from 'http';

dotenv.config();

const execPromise = promisify(exec);

// ============================================================
// CONFIG
// ============================================================

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_MODEL = 'gemini-2.0-flash';
const MCP_PORT = process.env.MCP_PORT || 3847;
const MCP_AUTH_KEY = process.env.MCP_AUTH_KEY;

// 🔒 Validate required credentials
if (!MCP_AUTH_KEY) {
  console.error('❌ ERROR: MCP_AUTH_KEY not set in .env');
  console.error('💡 Add to .env: MCP_AUTH_KEY=your-secret-key');
  process.exit(1);
}

const SYSTEM_PROMPT = `Bạn là Hải Bot - Trợ lý Zalo thông minh 🤖

📚 KIẾN THỨC ĐƯỢC DẠY:
- Gạo Việt Nam: sạch, hữu cơ
- Thị trường gạo
- Thông tin công ty

📋 QUY TẮC:
- Trả lời ngắn (1-2 dòng)
- Thân thiện, chuyên nghiệp
- Nếu không biết → "Xin lỗi, liên hệ 0902-273-991"`;

// ============================================================
// GEMINI AI
// ============================================================

async function askGemini(userMessage) {
  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;
    
    const response = await axios.post(url, {
      contents: [{ role: "user", parts: [{ text: userMessage }] }],
      systemInstruction: {
        parts: [{ text: SYSTEM_PROMPT }]
      },
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 200
      }
    }, {
      params: { key: GEMINI_API_KEY },
      timeout: 15000
    });
    
    return response.data?.candidates?.[0]?.content?.parts?.[0]?.text || "Xin lỗi, không thể trả lời.";
    
  } catch (error) {
    console.error('❌ Gemini error:', error.message);
    return "Xin lỗi, có lỗi xảy ra. Liên hệ: 0902-273-991";
  }
}

// ============================================================
// ZALO TOOLS (cho MCP Server)
// ============================================================

async function listThreads(limit = 10) {
  try {
    const { stdout } = await execPromise(`zalo-agent conv list --json 2>/dev/null || echo "[]"`);
    let threads = JSON.parse(stdout);
    return { success: true, data: threads.slice(0, limit) };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

async function sendMessage(threadId, message, isGroup = false) {
  try {
    const escapedMsg = message.replace(/"/g, '\\"');
    const cmd = `zalo-agent msg send ${threadId} "${escapedMsg}"${isGroup ? ' -t 1' : ''}`;
    await execPromise(cmd);
    return { success: true, sent: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// ============================================================
// MCP HTTP SERVER
// ============================================================

function startMcpServer() {
  const tools = [
    {
      name: "list_threads",
      description: "Lấy danh sách cuộc trò chuyện",
      inputSchema: {
        type: "object",
        properties: {
          limit: { type: "number", description: "Số lượng" }
        }
      }
    },
    {
      name: "send_message",
      description: "Gửi tin nhắn",
      inputSchema: {
        type: "object",
        properties: {
          threadId: { type: "string" },
          message: { type: "string" },
          isGroup: { type: "boolean" }
        },
        required: ["threadId", "message"]
      }
    }
  ];
  
  const server = http.createServer(async (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    
    if (req.method === 'OPTIONS') {
      res.writeHead(200);
      res.end();
      return;
    }
    
    const auth = req.headers.authorization;
    if (auth !== `Bearer ${MCP_AUTH_KEY}`) {
      res.writeHead(401);
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
          const { name, arguments: args } = request.params;
          let result;
          
          if (name === 'list_threads') {
            result = await listThreads(args.limit || 10);
          } else if (name === 'send_message') {
            result = await sendMessage(args.threadId, args.message, args.isGroup);
          } else {
            result = { error: 'Unknown tool' };
          }
          
          response = {
            jsonrpc: "2.0",
            id: request.id,
            result: { content: [{ type: "text", text: JSON.stringify(result) }] }
          };
        }
        
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(response));
      } catch (error) {
        res.writeHead(500);
        res.end(JSON.stringify({ error: error.message }));
      }
    });
  });
  
  server.listen(MCP_PORT, () => {
    console.log(`✓ MCP Server: http://localhost:${MCP_PORT}`);
  });
}

// ============================================================
// LISTENER (Auto-reply)
// ============================================================

async function startListener() {
  console.log('👂 Lắng nghe tin nhắn...\n');
  
  const child = exec('zalo-agent listen --json', { maxBuffer: 10 * 1024 * 1024 });
  
  let buffer = '';
  
  child.stdout.on('data', async (data) => {
    buffer += data.toString();
    const lines = buffer.split('\n');
    buffer = lines[lines.length - 1];
    
    for (let i = 0; i < lines.length - 1; i++) {
      const line = lines[i].trim();
      if (!line) continue;
      
      try {
        const event = JSON.parse(line);
        
        if (event.event !== 'message' || event.isSelf) continue;
        
        const { threadId, senderName, content, type } = event;
        const isGroup = type === 1;
        
        console.log(`\n📨 Từ ${senderName}: "${content}"`);
        
        // Gọi AI
        console.log('🤔 Đang suy nghĩ...');
        const reply = await askGemini(content);
        
        console.log(`💬 Trả lời: "${reply}"`);
        
        // Gửi
        const escapedMsg = reply.replace(/"/g, '\\"');
        const cmd = `zalo-agent msg send ${threadId} "${escapedMsg}"${isGroup ? ' -t 1' : ''}`;
        await execPromise(cmd);
        
        console.log('✓ Đã gửi');
        
      } catch (error) {
        // Ignore
      }
    }
  });
}

// ============================================================
// MAIN
// ============================================================

async function main() {
  console.log('\n' + '═'.repeat(60));
  console.log('🤖 ZALO HYBRID BOT v1.0 (MCP + AI)'.padStart(65));
  console.log('═'.repeat(60));
  
  console.log('✓ Gemini API: ' + GEMINI_API_KEY.substring(0, 20) + '...');
  
  // Khởi động MCP Server
  startMcpServer();
  
  // Khởi động Listener
  await startListener();
  
  process.on('SIGINT', () => {
    console.log('\n👋 Bot dừng.');
    process.exit(0);
  });
}

main().catch(console.error);
