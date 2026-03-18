#!/usr/bin/env node

/**
 * 👥 ZALO FRIEND MANAGER
 * Quản lý kết bạn, tìm kiếm người dùng, gửi lời mời kết bạn
 * 
 * Usage:
 *   node friend-manager.js list                    # Danh sách bạn bè
 *   node friend-manager.js search <name>           # Tìm bạn theo tên
 *   node friend-manager.js add <userId>            # Gửi lời mời kết bạn
 *   node friend-manager.js find <phone|zaID>       # Tìm theo SĐT hoặc Zalo ID
 *   node friend-manager.js info <userId>           # Xem thông tin bạn
 *   node friend-manager.js online                  # Bạn đang online
 *   node friend-manager.js remove <userId>         # Xóa bạn
 *   node friend-manager.js accept <userId>         # Chấp nhận lời mời
 *   node friend-manager.js block <userId>          # Chặn người dùng
 *   node friend-manager.js alias <userId> <name>   # Đặt biệt danh
 */

import { execSync } from 'child_process';

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  gray: '\x1b[90m',
};

function log(color, ...args) {
  console.log(`${color}${args.join(' ')}${colors.reset}`);
}

function executeCommand(cmd) {
  try {
    return execSync(cmd, {
      encoding: 'utf-8',
      stdio: ['pipe', 'pipe', 'pipe']
    });
  } catch (error) {
    throw new Error(error.message);
  }
}

async function listFriends() {
  try {
    log(colors.blue, '👥 Đang tải danh sách bạn bè...\n');
    
    const result = executeCommand('zalo-agent friend list');
    
    log(colors.green, '✅ Danh sách bạn bè:\n');
    console.log(result);
    
    return { success: true };
  } catch (error) {
    log(colors.red, `❌ Lỗi: ${error.message}`);
    return { success: false };
  }
}

async function searchFriend(name) {
  try {
    log(colors.blue, `🔍 Tìm kiếm bạn bè tên "${name}"...\n`);
    
    const result = executeCommand(`zalo-agent friend search "${name}"`);
    
    log(colors.green, '✅ Kết quả tìm kiếm:\n');
    console.log(result);
    
    return { success: true };
  } catch (error) {
    log(colors.red, `❌ Lỗi: ${error.message}`);
    return { success: false };
  }
}

async function findUser(query) {
  try {
    log(colors.blue, `🔍 Tìm kiếm người dùng "${query}"...\n`);
    
    const result = executeCommand(`zalo-agent friend find "${query}"`);
    
    log(colors.green, '✅ Kết quả:\n');
    console.log(result);
    
    return { success: true };
  } catch (error) {
    log(colors.red, `❌ Lỗi: ${error.message}`);
    return { success: false };
  }
}

async function addFriend(userId, message = null) {
  try {
    log(colors.blue, `👋 Gửi lời mời kết bạn tới ${userId}...`);
    
    let cmd = `zalo-agent friend add "${userId}"`;
    if (message) {
      cmd += ` -m "${message.replace(/"/g, '\\"')}"`;
    }
    
    const result = executeCommand(cmd);
    
    log(colors.green, '✅ Lời mời kết bạn đã gửi!\n');
    log(colors.cyan, result);
    
    return { success: true };
  } catch (error) {
    log(colors.red, `❌ Lỗi: ${error.message}`);
    return { success: false };
  }
}

async function acceptFriend(userId) {
  try {
    log(colors.blue, `✅ Chấp nhận lời mời kết bạn từ ${userId}...`);
    
    const result = executeCommand(`zalo-agent friend accept "${userId}"`);
    
    log(colors.green, '✅ Đã chấp nhận!\n');
    log(colors.cyan, result);
    
    return { success: true };
  } catch (error) {
    log(colors.red, `❌ Lỗi: ${error.message}`);
    return { success: false };
  }
}

async function removeFriend(userId) {
  try {
    log(colors.yellow, `⚠️  Xóa bạn ${userId}...`);
    
    const result = executeCommand(`zalo-agent friend remove "${userId}"`);
    
    log(colors.green, '✅ Bạn đã bị xóa!\n');
    log(colors.cyan, result);
    
    return { success: true };
  } catch (error) {
    log(colors.red, `❌ Lỗi: ${error.message}`);
    return { success: false };
  }
}

async function blockUser(userId) {
  try {
    log(colors.yellow, `🚫 Chặn người dùng ${userId}...`);
    
    const result = executeCommand(`zalo-agent friend block "${userId}"`);
    
    log(colors.green, '✅ Đã chặn!\n');
    log(colors.cyan, result);
    
    return { success: true };
  } catch (error) {
    log(colors.red, `❌ Lỗi: ${error.message}`);
    return { success: false };
  }
}

async function unblockUser(userId) {
  try {
    log(colors.blue, `✅ Bỏ chặn người dùng ${userId}...`);
    
    const result = executeCommand(`zalo-agent friend unblock "${userId}"`);
    
    log(colors.green, '✅ Đã bỏ chặn!\n');
    log(colors.cyan, result);
    
    return { success: true };
  } catch (error) {
    log(colors.red, `❌ Lỗi: ${error.message}`);
    return { success: false };
  }
}

async function getFriendInfo(userId) {
  try {
    log(colors.blue, `ℹ️  Xem thông tin bạn ${userId}...\n`);
    
    const result = executeCommand(`zalo-agent friend info "${userId}"`);
    
    log(colors.green, '✅ Thông tin:\n');
    console.log(result);
    
    return { success: true };
  } catch (error) {
    log(colors.red, `❌ Lỗi: ${error.message}`);
    return { success: false };
  }
}

async function getOnlineFriends() {
  try {
    log(colors.blue, '📱 Bạn bè đang online...\n');
    
    const result = executeCommand('zalo-agent friend online');
    
    log(colors.green, '✅ Bạn đang online:\n');
    console.log(result);
    
    return { success: true };
  } catch (error) {
    log(colors.red, `❌ Lỗi: ${error.message}`);
    return { success: false };
  }
}

async function setAlias(userId, alias) {
  try {
    log(colors.blue, `📝 Đặt biệt danh "${alias}" cho ${userId}...`);
    
    const result = executeCommand(`zalo-agent friend alias "${userId}" "${alias}"`);
    
    log(colors.green, '✅ Biệt danh đã được đặt!\n');
    log(colors.cyan, result);
    
    return { success: true };
  } catch (error) {
    log(colors.red, `❌ Lỗi: ${error.message}`);
    return { success: false };
  }
}

async function getFriendRequests() {
  try {
    log(colors.blue, '📥 Danh sách lời mời kết bạn...\n');
    
    const result = executeCommand('zalo-agent friend recommendations');
    
    log(colors.green, '✅ Lời mời kết bạn:\n');
    console.log(result);
    
    return { success: true };
  } catch (error) {
    log(colors.red, `❌ Lỗi: ${error.message}`);
    return { success: false };
  }
}

function printUsage() {
  log(colors.cyan, '\n📖 CÁCH SỬ DỤNG:\n');
  log(colors.green, 'node friend-manager.js <command> [args]\n');
  
  log(colors.yellow, '🎯 DANH SÁCH LỆNH:\n');
  log(colors.white, '  list                          # Danh sách tất cả bạn bè');
  log(colors.white, '  search <name>                 # Tìm bạn theo tên');
  log(colors.white, '  find <phone|zaID>             # Tìm người dùng');
  log(colors.white, '  info <userId>                 # Xem thông tin bạn');
  log(colors.white, '  online                        # Bạn đang online');
  log(colors.white, '  add <userId> [message]        # Gửi lời mời kết bạn');
  log(colors.white, '  accept <userId>               # Chấp nhận lời mời');
  log(colors.white, '  remove <userId>               # Xóa bạn');
  log(colors.white, '  block <userId>                # Chặn người dùng');
  log(colors.white, '  unblock <userId>              # Bỏ chặn');
  log(colors.white, '  alias <userId> <name>         # Đặt biệt danh');
  log(colors.white, '  requests                      # Lời mời chờ xử lý\n');
  
  log(colors.yellow, '💡 VÍ DỤ:\n');
  log(colors.green, 'node friend-manager.js list');
  log(colors.green, 'node friend-manager.js search "Hào"');
  log(colors.green, 'node friend-manager.js add 123456789');
  log(colors.green, 'node friend-manager.js alias 123456789 "Hào Hào"\n');
}

async function main() {
  const args = process.argv.slice(2);

  log(colors.magenta, '════════════════════════════════════════════');
  log(colors.magenta, '👥 ZALO FRIEND MANAGER');
  log(colors.magenta, '════════════════════════════════════════════\n');

  if (args.length === 0) {
    printUsage();
    process.exit(1);
  }

  const command = args[0].toLowerCase();
  let result = { success: false };

  switch (command) {
    case 'list':
      result = await listFriends();
      break;
    case 'search':
      if (args.length < 2) {
        log(colors.red, '❌ Thiếu tên để tìm kiếm');
        process.exit(1);
      }
      result = await searchFriend(args[1]);
      break;
    case 'find':
      if (args.length < 2) {
        log(colors.red, '❌ Thiếu số điện thoại hoặc Zalo ID');
        process.exit(1);
      }
      result = await findUser(args[1]);
      break;
    case 'info':
      if (args.length < 2) {
        log(colors.red, '❌ Thiếu userId');
        process.exit(1);
      }
      result = await getFriendInfo(args[1]);
      break;
    case 'online':
      result = await getOnlineFriends();
      break;
    case 'add':
      if (args.length < 2) {
        log(colors.red, '❌ Thiếu userId');
        process.exit(1);
      }
      result = await addFriend(args[1], args[2] || null);
      break;
    case 'accept':
      if (args.length < 2) {
        log(colors.red, '❌ Thiếu userId');
        process.exit(1);
      }
      result = await acceptFriend(args[1]);
      break;
    case 'remove':
      if (args.length < 2) {
        log(colors.red, '❌ Thiếu userId');
        process.exit(1);
      }
      result = await removeFriend(args[1]);
      break;
    case 'block':
      if (args.length < 2) {
        log(colors.red, '❌ Thiếu userId');
        process.exit(1);
      }
      result = await blockUser(args[1]);
      break;
    case 'unblock':
      if (args.length < 2) {
        log(colors.red, '❌ Thiếu userId');
        process.exit(1);
      }
      result = await unblockUser(args[1]);
      break;
    case 'alias':
      if (args.length < 3) {
        log(colors.red, '❌ Thiếu userId hoặc tên biệt danh');
        process.exit(1);
      }
      result = await setAlias(args[1], args[2]);
      break;
    case 'requests':
      result = await getFriendRequests();
      break;
    default:
      log(colors.red, `❌ Lệnh không tìm thấy: ${command}`);
      printUsage();
      process.exit(1);
  }

  log(colors.magenta, '\n════════════════════════════════════════════');
  log(colors.magenta, result.success ? '✅ HOÀN THÀNH' : '❌ CÓ LỖI');
  log(colors.magenta, '════════════════════════════════════════════');

  process.exit(result.success ? 0 : 1);
}

main().catch(error => {
  log(colors.red, '❌ Fatal error:', error.message);
  process.exit(1);
});
