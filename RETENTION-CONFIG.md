# Configurable Retention Time - Quick Guide

## ✅ **Environment Variable Added!**

You can now control how long deleted assets are kept before permanent deletion!

---

## 🔧 **Configuration:**

### **Add to your `.env` file:**
```bash
# How many hours to keep deleted assets before permanent S3 deletion
ASSET_RETENTION_HOURS=90
```

---

## ⏰ **Examples:**

### **90 Hours (Default - ~3.75 days)**
```bash
ASSET_RETENTION_HOURS=90
```
Users have 90 hours to restore deleted files.

### **24 Hours (1 day)**
```bash
ASSET_RETENTION_HOURS=24
```
Faster cleanup, less storage cost.

### **168 Hours (7 days)**
```bash
ASSET_RETENTION_HOURS=168
```
Longer recovery window for users.

### **1 Hour (Testing)**
```bash
ASSET_RETENTION_HOURS=1
```
Quick cleanup for development/testing.

---

## 📝 **How to Change:**

### **Step 1: Edit `.env`**
```bash
# Open .env file
notepad .env

# Change the value
ASSET_RETENTION_HOURS=48  # 2 days
```

### **Step 2: Restart Server**
```bash
# Stop server (Ctrl+C)
# Start again
npm run dev
```

### **Step 3: Verify**
Check server logs on startup:
```
⏰ Retention period: 48 hours
🧹 Cleanup: Every 6hrs (48hrs retention)
```

---

## 🧪 **Testing Different Times:**

### **Quick Test (1 hour)**
```bash
ASSET_RETENTION_HOURS=1
```
Delete a file → Wait 1 hour → Cron runs → File deleted from S3

### **Production (7 days)**
```bash
ASSET_RETENTION_HOURS=168
```
Users have a full week to recover deleted files.

---

## 📊 **Recommended Values:**

| Use Case | Hours | Days | Description |
|----------|-------|------|-------------|
| **Development/Testing** | 1-6 | <1 day | Quick cleanup |
| **Default (Balanced)** | 90 | ~3.75 days | Good balance |
| **User-Friendly** | 168-336 | 7-14 days | More recovery time |
| **Production Safe** | 720 | 30 days | Maximum safety |

---

## 🔍 **How It Works:**

### **Calculation:**
```typescript
const retentionHours = env.ASSET_RETENTION_HOURS; // From .env
const retentionAgo = new Date(Date.now() - retentionHours * 60 * 60 * 1000);

// Find assets deleted before this time
const oldAssets = await Asset.find({
  isDeleted: true,
  updatedAt: { $lt: retentionAgo }
});
```

### **Example Timeline (with 48 hours):**
```
Day 1, 10:00 AM  → User deletes file
                    MongoDB: isDeleted = true

Day 3, 10:00 AM  → 48 hours passed
                    Next cron run → File deleted from S3

vs. Default (90 hours):

Day 1, 10:00 AM  → User deletes file
Day 4, 10:00 PM  → 90 hours passed → Deleted
```

---

## ✅ **Summary:**

**Configuration**: Add `ASSET_RETENTION_HOURS` to `.env`  
**Default**: 90 hours (~3.75 days)  
**Range**: Any positive number (1 to 99999)  
**Change**: Edit `.env` → Restart server  

**Ab aap easily time control kar sakte ho! 🎯**

---

## 🚀 **Current Setup:**

Your `.env` should look like:
```bash
# ... other variables ...

# Asset Retention (NEW!)
ASSET_RETENTION_HOURS=90
```

**Restart server to apply changes!**
