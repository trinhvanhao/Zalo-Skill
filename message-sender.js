#!/usr/bin/env node

/**
 * 🚀 ZALO MESSAGE SENDER
 * Gửi tin nhắn đến bạn bè trên Zalo
 * 
 * Usage:
 *   node message-sender.js <threadId> <message>
 *   node message-sender.js <threadId> <message> --image <imagePath>
 *   node message-sender.js <threadId> <message> --file <filePath>
 * 
 * Examples:
 *   node message-sender.js 123456789 "Hello!"
 *   node message-sender.js 123456789 "Check this" --image /path/to/photo.jpg
 */

import { execSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
};

function log(color, ...args) {
  console.log(`${color}${args.join(' ')}${colors.reset}`);
}

function parseArgs() {
  const args = process.argv.slice(2);
  
  if (args.length < 2) {
    log(colors.red, '❌ Usage: node message-sender.js <threadId> <message> [options]');
    log(colors.yellow, '\nOptions:');
    log(colors.cyan, '  --image <path>   Send image');
    log(colors.cyan, '  --file <path>    Send file');
    log(colors.cyan, '  --voice <url>    Send voice message');
    log(colors.cyan, '  --link <url>     Send link');
    log(colors.cyan, '\nExamples:');
    log(colors.green, '  node message-sender.js 123456789 "Hello!"');
    log(colors.green, '  node message-sender.js 123456789 "Photo" --image photo.jpg');
    process.exit(1);
  }

  const threadId = args[0];
  const message = args[1];
  const options = {};

  for (let i = 2; i < args.length; i += 2) {
    const key = args[i].replace('--', '');
    const value = args[i + 1];
    options[key] = value;
  }

  return { threadId, message, options };
}

async function resolveThreadId(identifier) {
  try {
    // Kiểm xem có phải số hay không
    if (/^\d+$/.test(identifier)) {
      return identifier; // Là ID rồi
    }
    
    // Tìm từ tên liên hệ
    log(colors.blue, `🔍 Tìm ID từ tên "${identifier}"...`);
    const searchCmd = `zalo-agent friend search "${identifier}" 2>/dev/null`;
    const searchResult = execSync(searchCmd, { encoding: 'utf-8' });
    
    // Parse kết quả để lấy ID (dòng đầu tiên trong kết quả là ID)
    const lines = searchResult.split('\n').filter(l => l.trim());
    const idLine = lines.find(l => /^\d{19}/.test(l.trim()));
    
    if (!idLine) {
      throw new Error(`Không tìm thấy liên hệ "${identifier}"`);
    }
    
    const foundId = idLine.trim().split(/\s+/)[0];
    const foundName = idLine.trim().split(/\s+/).slice(1).join(' ');
    log(colors.green, `✅ Tìm được: ${foundName} (ID: ${foundId})`);
    
    return foundId;
  } catch (error) {
    throw new Error(`Lỗi tìm ID: ${error.message}`);
  }
}

async function sendTextMessage(threadId, message) {
  try {
    // Giải quyết threadId (có thể là tên hoặc ID)
    const resolvedId = await resolveThreadId(threadId);
    
    log(colors.blue, `📨 Gửi tin nhắn tới thread ${resolvedId}...`);
    log(colors.cyan, `📝 Nội dung: "${message}"`);
    
    const cmd = `zalo-agent msg send "${resolvedId}" "${message.replace(/"/g, '\\"')}"`;
    const result = execSync(cmd, { encoding: 'utf-8', stdio: ['pipe', 'pipe', 'pipe'] });
    
    log(colors.green, '✅ Gửi thành công!');
    return { success: true, result };
  } catch (error) {
    log(colors.red, `❌ Lỗi gửi tin nhắn: ${error.message}`);
    return { success: false, error: error.message };
  }
}

async function sendImage(threadId, message, imagePath) {
  try {
    // Kiểm tra file ảnh tồn tại
    const fullPath = path.resolve(imagePath);
    if (!fs.existsSync(fullPath)) {
      throw new Error(`Ảnh không tìm thấy: ${fullPath}`);
    }

    log(colors.blue, `📨 Gửi ảnh + tin nhắn tới thread ${threadId}...`);
    log(colors.cyan, `📝 Nội dung: "${message}"`);
    log(colors.cyan, `🖼️  Ảnh: ${fullPath}`);
    
    // Gửi ảnh trước
    execSync(`zalo-agent msg send-image "${threadId}" "${fullPath}"`, {
      encoding: 'utf-8',
      stdio: ['pipe', 'pipe', 'pipe']
    });

    // Gửi text sau
    if (message.trim()) {
      execSync(`zalo-agent msg send "${threadId}" "${message.replace(/"/g, '\\"')}"`, {
        encoding: 'utf-8',
        stdio: ['pipe', 'pipe', 'pipe']
      });
    }

    log(colors.green, '✅ Gửi ảnh + tin nhắn thành công!');
    return { success: true };
  } catch (error) {
    log(colors.red, `❌ Lỗi gửi ảnh: ${error.message}`);
    return { success: false, error: error.message };
  }
}

async function sendFile(threadId, message, filePath) {
  try {
    // Kiểm tra file tồn tại
    const fullPath = path.resolve(filePath);
    if (!fs.existsSync(fullPath)) {
      throw new Error(`File không tìm thấy: ${fullPath}`);
    }

    log(colors.blue, `📨 Gửi file + tin nhắn tới thread ${threadId}...`);
    log(colors.cyan, `📝 Nội dung: "${message}"`);
    log(colors.cyan, `📎 File: ${fullPath}`);
    
    // Gửi file trước
    execSync(`zalo-agent msg send-file "${threadId}" "${fullPath}"`, {
      encoding: 'utf-8',
      stdio: ['pipe', 'pipe', 'pipe']
    });

    // Gửi text sau
    if (message.trim()) {
      execSync(`zalo-agent msg send "${threadId}" "${message.replace(/"/g, '\\"')}"`, {
        encoding: 'utf-8',
        stdio: ['pipe', 'pipe', 'pipe']
      });
    }

    log(colors.green, '✅ Gửi file + tin nhắn thành công!');
    return { success: true };
  } catch (error) {
    log(colors.red, `❌ Lỗi gửi file: ${error.message}`);
    return { success: false, error: error.message };
  }
}

async function sendLink(threadId, message, url) {
  try {
    log(colors.blue, `📨 Gửi link tới thread ${threadId}...`);
    log(colors.cyan, `📝 Nội dung: "${message}"`);
    log(colors.cyan, `🔗 Link: ${url}`);
    
    // Gửi link
    execSync(`zalo-agent msg send-link "${threadId}" "${url}"`, {
      encoding: 'utf-8',
      stdio: ['pipe', 'pipe', 'pipe']
    });

    // Gửi text
    if (message.trim()) {
      execSync(`zalo-agent msg send "${threadId}" "${message.replace(/"/g, '\\"')}"`, {
        encoding: 'utf-8',
        stdio: ['pipe', 'pipe', 'pipe']
      });
    }

    log(colors.green, '✅ Gửi link thành công!');
    return { success: true };
  } catch (error) {
    log(colors.red, `❌ Lỗi gửi link: ${error.message}`);
    return { success: false, error: error.message };
  }
}

async function sendVoice(threadId, message, voiceUrl) {
  try {
    log(colors.blue, `📨 Gửi tin tức tới thread ${threadId}...`);
    log(colors.cyan, `📝 Nội dung: "${message}"`);
    log(colors.cyan, `🎵 Voice: ${voiceUrl}`);
    
    // Gửi voice
    execSync(`zalo-agent msg send-voice "${threadId}" "${voiceUrl}"`, {
      encoding: 'utf-8',
      stdio: ['pipe', 'pipe', 'pipe']
    });

    // Gửi text
    if (message.trim()) {
      execSync(`zalo-agent msg send "${threadId}" "${message.replace(/"/g, '\\"')}"`, {
        encoding: 'utf-8',
        stdio: ['pipe', 'pipe', 'pipe']
      });
    }

    log(colors.green, '✅ Gửi voice message thành công!');
    return { success: true };
  } catch (error) {
    log(colors.red, `❌ Lỗi gửi voice: ${error.message}`);
    return { success: false, error: error.message };
  }
}

async function main() {
  const { threadId, message, options } = parseArgs();

  log(colors.magenta, '════════════════════════════════════════════');
  log(colors.magenta, '📨 ZALO MESSAGE SENDER');
  log(colors.magenta, '════════════════════════════════════════════\n');

  let result;

  if (options.image) {
    result = await sendImage(threadId, message, options.image);
  } else if (options.file) {
    result = await sendFile(threadId, message, options.file);
  } else if (options.link) {
    result = await sendLink(threadId, message, options.link);
  } else if (options.voice) {
    result = await sendVoice(threadId, message, options.voice);
  } else {
    result = await sendTextMessage(threadId, message);
  }

  log(colors.magenta, '\n════════════════════════════════════════════');
  log(colors.magenta, result.success ? '✅ HOÀN THÀNH' : '❌ LỖI');
  log(colors.magenta, '════════════════════════════════════════════');

  process.exit(result.success ? 0 : 1);
}

main().catch(error => {
  log(colors.red, '❌ Fatal error:', error.message);
  process.exit(1);
});
