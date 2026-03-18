#!/usr/bin/env node

/**
 * 🤖 Zalo AI Auto-Reply Bot v1.0
 * 
 * Tính năng:
 * - Lắng nghe tin nhắn Zalo (cá nhân + nhóm)
 * - Xử lý với Gemini AI
 * - Trả lời tự động thông minh
 * - Có thể dạy kiến thức qua SYSTEM_PROMPT
 */

import dotenv from 'dotenv';
import axios from 'axios';
import { exec } from 'child_process';
import { promisify } from 'util';

dotenv.config();

const execPromise = promisify(exec);

// ============================================================
// ⚙️ CONFIG
// ============================================================

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_MODEL = 'gemini-2.0-flash';

// 🎓 SYSTEM PROMPT - Kiến thức được dạy cho bot
const SYSTEM_PROMPT = `Bạn là một trợ lý Zalo thông minh tên "Hải Bot" 🤖

📚 KIẾN THỨC VỀ GẠO VIỆT NAM:
1. Thị trường gạo Việt Nam:
   - Gạo sạch (clean rice): không sử dụng hóa chất độc hại
   - Gạo hữu cơ (organic rice): trồng hoàn toàn tự nhiên
   - Xuất khẩu chính tới: Nhật, EU, Hàn Quốc
   - Giá gạo sạch: 12,000-18,000đ/kg
   - Giá gạo hữu cơ: 25,000-35,000đ/kg

2. Sản phẩm nổi bật:
   - Gạo OM5604: chất lượng cao, giá cạnh tranh
   - Gạo Jasmine: thơm, dẻo, chất lượng Premium
   - Gạo ST21: năng suất cao, giá phổ thông

3. Lợi ích gạo sạch vs hữu cơ:
   - Gạo sạch: An toàn, giá hợp lý, dễ mua
   - Gạo hữu cơ: Tốt cho sức khỏe, bền vững, giữ được chất lượng lâu

4. Thông tin công ty (VD):
   - Tên: Công ty Lúa Gạo Thật Chất
   - Hotline: 0902-273-991
   - Email: contact@luagaothatchat.vn
   - Địa chỉ: TP.HCM, Việt Nam
   - Giao hàng: Toàn quốc, miễn phí >1 tấn
   - Hỗ trợ: 24/7

📋 QUY TẮC TRẢ LỜI:
✓ Trả lời ngắn gọn (1-2 dòng, tối đa 200 ký tự)
✓ Thân thiện, chuyên nghiệp, chuẩn Việt
✓ Nếu không biết: "Xin lỗi, tôi không có thông tin về điều này. Liên hệ hotline 0902-273-991"
✓ Tránh trả lời những câu hỏi không liên quan
✓ Sử dụng emoji phù hợp khi cần
✓ Không trả lời các câu hỏi chính trị, tôn giáo, nhạy cảm`;

// ============================================================
// 🔌 GEMINI AI
// ============================================================

async function askGemini(userMessage, conversationHistory = []) {
    try {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;
        
        const messages = [
            ...conversationHistory,
            { role: "user", parts: [{ text: userMessage }] }
        ];
        
        const payload = {
            contents: messages,
            systemInstruction: {
                parts: [{ text: SYSTEM_PROMPT }]
            },
            generationConfig: {
                temperature: 0.7,
                maxOutputTokens: 200,
                topP: 0.9
            }
        };
        
        const response = await axios.post(url, payload, {
            params: { key: GEMINI_API_KEY },
            timeout: 15000
        });
        
        const reply = response.data?.candidates?.[0]?.content?.parts?.[0]?.text;
        
        if (!reply) {
            return "Xin lỗi, tôi không thể trả lời lúc này. Vui lòng thử lại sau.";
        }
        
        return reply.trim();
        
    } catch (error) {
        console.error('❌ Lỗi Gemini:', error.response?.data?.error?.message || error.message);
        
        if (error.code === 'ECONNABORTED') {
            return "Tôi đang bận. Vui lòng thử lại sau.";
        }
        
        return "Xin lỗi, có lỗi xảy ra. Liên hệ: 0902-273-991";
    }
}

// ============================================================
// 📤 SEND REPLY
// ============================================================

async function sendReply(threadId, messageText, isGroup = false) {
    try {
        // Escape quotes
        const escapedMsg = messageText.replace(/"/g, '\\"').replace(/\$/g, '\\$');
        const cmd = `zalo-agent msg send ${threadId} "${escapedMsg}"${isGroup ? ' -t 1' : ''}`;
        
        await execPromise(cmd);
        console.log(`✓ Đã gửi trả lời tới ${isGroup ? '👥 nhóm' : '👤 cá nhân'}: ${threadId}`);
        
    } catch (error) {
        console.error(`❌ Lỗi gửi tin:`, error.message);
    }
}

// ============================================================
// 👂 LISTENER
// ============================================================

async function startListener() {
    console.log('\n🤖 Khởi động Zalo AI Bot...');
    console.log('👂 Lắng nghe tin nhắn...\n');
    
    // Chạy listener zalo-agent
    const child = exec('zalo-agent listen --json', { maxBuffer: 10 * 1024 * 1024 });
    
    let buffer = '';
    let messageCount = 0;
    
    child.stdout.on('data', async (data) => {
        buffer += data.toString();
        
        // Xử lý từng dòng JSON
        const lines = buffer.split('\n');
        buffer = lines[lines.length - 1];
        
        for (let i = 0; i < lines.length - 1; i++) {
            const line = lines[i].trim();
            if (!line) continue;
            
            try {
                const event = JSON.parse(line);
                
                // Kiểm tra xem có phải tin nhắn không
                if (event.event !== 'message') continue;
                if (event.isSelf) continue; // Bỏ qua tin của chính bot
                if (!event.content || event.content.trim() === '') continue;
                
                const threadId = event.threadId;
                const senderName = event.senderName || 'Khách';
                const messageText = event.content.trim();
                const isGroup = event.type === 1; // 0=cá nhân, 1=nhóm
                
                messageCount++;
                
                console.log(`\n📨 [${new Date().toLocaleTimeString()}] Tin nhắn #${messageCount}`);
                console.log(`   Từ: ${isGroup ? '👥' : '👤'} ${senderName}`);
                console.log(`   Nội dung: "${messageText}"`);
                
                // Gọi Gemini để tạo reply
                console.log('   🤔 Đang suy nghĩ...');
                const reply = await askGemini(messageText);
                
                console.log(`   💬 Trả lời: "${reply}"`);
                
                // Gửi reply
                await sendReply(threadId, reply, isGroup);
                
            } catch (error) {
                // Bỏ qua các dòng không phải JSON
                if (line.includes('Listening') || 
                    line.includes('Events') || 
                    line.includes('Auto-reconnect') ||
                    line.includes('zca-js') ||
                    line.includes('INFO')) {
                    continue;
                }
                // console.error('Lỗi xử lý:', error.message);
            }
        }
    });
    
    child.stderr.on('data', (data) => {
        const msg = data.toString();
        if (!msg.includes('zca-js') && !msg.includes('INFO')) {
            console.error('⚠️ Listener error:', msg);
        }
    });
    
    child.on('close', (code) => {
        console.log(`\n⚠️ Listener đóng với code ${code}`);
    });
}

// ============================================================
// 🚀 MAIN
// ============================================================

async function main() {
    console.log('\n' + '═'.repeat(60));
    console.log('🤖 ZALO AI AUTO-REPLY BOT v1.0'.padStart(65));
    console.log('═'.repeat(60));
    
    // Kiểm tra API key
    if (!GEMINI_API_KEY) {
        console.error('\n❌ Lỗi: Không tìm thấy GEMINI_API_KEY trong .env');
        console.error('📖 Hướng dẫn: https://aistudio.google.com → "Get API Key"');
        process.exit(1);
    }
    
    console.log('✓ Gemini API key: ' + GEMINI_API_KEY.substring(0, 20) + '...');
    
    // Kiểm tra zalo-agent
    try {
        const { stdout } = await execPromise('zalo-agent status');
        if (stdout.includes('Logged in')) {
            console.log('✓ Zalo-agent: ' + stdout.split('\n')[1]?.trim() || '✓ Đã đăng nhập');
        }
    } catch (error) {
        console.error('\n❌ Lỗi: Cần cài zalo-agent-cli trước');
        console.error('   npm install -g zalo-agent-cli');
        process.exit(1);
    }
    
    console.log('\n' + '─'.repeat(60));
    console.log('📚 Kiến thức được dạy:');
    console.log('   • Gạo Việt Nam (sạch, hữu cơ)');
    console.log('   • Thị trường, giá cả');
    console.log('   • Thông tin công ty (hotline, địa chỉ, v.v)');
    console.log('─'.repeat(60));
    
    // Bắt đầu listener
    await startListener();
    
    // Giữ process chạy
    process.on('SIGINT', () => {
        console.log('\n\n👋 Bot dừng.');
        process.exit(0);
    });
}

main().catch(console.error);
