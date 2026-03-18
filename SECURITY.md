# 🔒 Security Policy

**Last Updated:** 2026-03-19

## 🛡️ Security Standards

This project follows these security practices:

### ✅ What's Protected
- **API Keys & Credentials:** All API keys (Gemini, Telegram, etc.) stored in `.env` (not tracked in Git)
- **MCP Auth Key:** Requires secure key in environment variables
- **Sensitive Files:** `logs/`, `reports/`, `backups/`, `node_modules/` excluded from version control
- **User Data:** Chat messages, user IDs, phone numbers not stored in repo

### 🔍 What's Audited
- ✅ No hardcoded secrets in source code
- ✅ No credentials in commit history
- ✅ `.env` in `.gitignore`
- ✅ No plaintext passwords in documentation
- ✅ All environment variables properly handled

---

## 🚀 Setup Securely

### 1. Copy `.env.example` to `.env`
```bash
cp .env.example .env
```

### 2. Generate Secure MCP_AUTH_KEY
```bash
# Use OpenSSL to generate random key
openssl rand -base64 32

# Or use any random string (minimum 16 characters)
# Save to .env as: MCP_AUTH_KEY=your-key-here
```

### 3. Add Your API Keys
```bash
# Edit .env
nano .env

# Add actual keys:
# GEMINI_API_KEY=AIzaSy...
# TELEGRAM_BOT_TOKEN=123456789:ABCdef...
# TELEGRAM_CHAT_ID=987654321
```

### 4. Verify .env is Ignored
```bash
# Should NOT show .env in tracked files
git status

# Should NOT show .env in tracked history
git ls-files | grep -i env
```

---

## ⚠️ Common Mistakes

### ❌ DON'T
```bash
# Never commit .env
git add .env
git push

# Never hardcode secrets in code
const API_KEY = "AIzaSy...";  // ❌ WRONG

# Never paste keys in documentation
# My key is: AIzaSyC...  // ❌ WRONG

# Never use default/weak auth keys
MCP_AUTH_KEY=secret-key-123  // ❌ WEAK
```

### ✅ DO
```bash
# Use environment variables
const API_KEY = process.env.GEMINI_API_KEY;

# Use strong random keys
openssl rand -base64 32

# Document without exposing secrets
# Get key from: https://aistudio.google.com  // ✅ SAFE

# Validate required credentials
if (!process.env.GEMINI_API_KEY) {
  throw new Error('GEMINI_API_KEY not set');
}
```

---

## 🔐 Credential Rotation

If you suspect credentials are compromised:

### 1. **Gemini API Key**
```bash
# 1. Visit: https://aistudio.google.com
# 2. Delete old key
# 3. Generate new key
# 4. Update .env: GEMINI_API_KEY=new-key
# 5. Restart bot: npm start
```

### 2. **Telegram Bot Token**
```bash
# 1. Message @BotFather on Telegram
# 2. /revoke (revoke current token)
# 3. /start (get new token)
# 4. Update .env: TELEGRAM_BOT_TOKEN=new-token
# 5. Restart: npm run report:1
```

### 3. **MCP Auth Key**
```bash
# 1. Generate new secure key:
openssl rand -base64 32

# 2. Update .env: MCP_AUTH_KEY=new-key
# 3. Restart: npm run mcp
```

---

## 🔬 Git Security Checks

### Check for secrets in commit history
```bash
# Check if .env was ever committed
git log --all --full-history -- .env

# Search for common patterns
git log -S "password" --source --all
git log -S "api_key" --source --all
```

### Remove accidentally committed files
If you accidentally commit a secret:

```bash
# Remove file from Git history (ONLY for local repo!)
git filter-branch --force --index-filter \
  'git rm --cached --ignore-unmatch .env' \
  --prune-empty --tag-name-filter cat -- --all

# Push to remote (force push - use with caution)
git push origin --force --all
```

⚠️ **Warning:** Force push rewrites history. Only use on repos you control!

---

## 📋 Environment Variables Reference

| Variable | Required | Where to Get | Example |
|----------|----------|--------------|---------|
| `GEMINI_API_KEY` | ✅ Yes | https://aistudio.google.com | `AIzaSyC...` |
| `MCP_AUTH_KEY` | ✅ Yes | Generate: `openssl rand -base64 32` | `abc+def/123==` |
| `TELEGRAM_BOT_TOKEN` | ❌ Optional | @BotFather on Telegram | `123:ABCdef...` |
| `TELEGRAM_CHAT_ID` | ❌ Optional | @userinfobot on Telegram | `987654321` |
| `ZALO_PHONE` | ❌ Optional | Your phone number | `+84902273991` |
| `MCP_PORT` | ❌ Optional | Default: 3847 | `3847` |

---

## 🚨 Security Issues

Found a security vulnerability? 

**Please DO NOT open a public GitHub issue.**

Instead:
1. Email: security@example.com
2. Or: Direct message on Telegram/Zalo
3. Include: Description, impact, reproduction steps
4. Timeline: We'll respond within 24 hours

---

## ✅ Security Checklist

Before deploying to production:

- [ ] `.env` is in `.gitignore`
- [ ] No hardcoded API keys in source code
- [ ] No `node_modules/` tracked in Git
- [ ] `MCP_AUTH_KEY` is strong (minimum 16 characters)
- [ ] All required env vars are set in production
- [ ] `.env.example` exists with placeholder values
- [ ] Git history checked for secrets
- [ ] All dependencies are up to date (`npm audit`)

---

## 📚 Resources

- [OWASP - Secrets Management](https://cheatsheetseries.owasp.org/cheatsheets/Secrets_Management_Cheat_Sheet.html)
- [GitHub - Secret Scanning](https://docs.github.com/en/code-security/secret-scanning)
- [npm audit](https://docs.npmjs.com/cli/v10/commands/npm-audit)
- [Git Documentation](https://git-scm.com/docs)

---

**Stay secure! 🔒**
