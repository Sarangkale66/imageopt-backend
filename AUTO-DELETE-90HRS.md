# Asset Restore Feature - 90 Hour Recovery Window

## ✅ **Perfect Flow!**

### **Delete → 90 Hours → Auto-Delete**

```
User Delete → Soft Delete → User has 90hrs to Restore → If NOT restored → Permanent Delete
```

---

## 🔄 **How It Works:**

### **1. User Deletes Asset**
```bash
DELETE /api/assets/:id
```
**Result**: 
- ✅ MongoDB: `isDeleted: true`
- ⏱️ S3: File still exists (90-hour grace period)

---

### **2. User Can Restore (Within 90 Hours)**
```bash
PUT /api/assets/:id/restore
```
**Result**:
- ✅ MongoDB: `isDeleted: false` (back to normal!)
- ✅ S3: File remains (never deleted)
- ✅ User gets their file back!

---

### **3. Auto-Delete After 90 Hours (If NOT Restored)**
**Cron Job** (runs every 6 hours):
- 🔍 Finds: `isDeleted: true` AND `updatedAt > 90 hours ago`
- 🗑️ Deletes from S3
- 🗑️ Permanently deletes from MongoDB

---

## 💻 **API Endpoints:**

### **Delete Asset (Soft)**
```bash
curl -X DELETE http://localhost:5000/api/assets/ASSET_ID \
  -H "Authorization: Bearer TOKEN"
```

**Response**:
```json
{
  "success": true,
  "message": "Asset deleted successfully"
}
```

---

### **Restore Asset** ⭐ **NEW!**
```bash
curl -X PUT http://localhost:5000/api/assets/ASSET_ID/restore \
  -H "Authorization: Bearer TOKEN"
```

**Response**:
```json
{
  "success": true,
  "message": "Asset restored successfully"
}
```

---

## 📊 **Example Timeline:**

```
Day 1, 10:00 AM  → User deletes file
                    MongoDB: isDeleted = true
                    S3: File exists ✅

Day 2, 11:00 AM  → User realizes mistake
                    Calls RESTORE endpoint
                    MongoDB: isDeleted = false ✅
                    File recovered! 🎉

Alternative Timeline (No Restore):

Day 1, 10:00 AM  → User deletes file
                    MongoDB: isDeleted = true
                    S3: File exists ✅

[90 hours pass...]

Day 4, 10:00 PM  → Cron job runs
                    Checks: updatedAt < 90 hrs ago
                    Deletes from S3 🗑️
                    Deletes from MongoDB 🗑️
                    File permanently gone
```

---

## 🎯 **User Flow:**

### **Scenario 1: Quick Recovery**
1. User accidentally deletes important file → 😱
2. Checks deleted files list → 📋
3. Clicks "Restore" → ✅
4. File is back! → 🎉

### **Scenario 2: Intentional Delete**
1. User deletes unwanted file → 🗑️
2. Doesn't restore → ⏰
3. After 90 hours, S3 auto-cleans → 💰 (saves storage cost)

---

## 📝 **PowerShell Test:**

```powershell
# 1. Get token
$token = "YOUR_JWT_TOKEN"

# 2. Delete asset
$assetId = "ASSET_ID_HERE"
Invoke-RestMethod -Uri "http://localhost:5000/api/assets/$assetId" `
  -Method DELETE `
  -Headers @{ "Authorization" = "Bearer $token" }

# Check: Asset is soft-deleted (isDeleted: true)

# 3. Restore it!
Invoke-RestMethod -Uri "http://localhost:5000/api/assets/$assetId/restore" `
  -Method PUT `
  -Headers @{ "Authorization" = "Bearer $token" }

# Check: Asset is active again (isDeleted: false)
```

---

## ✅ **Summary:**

| Action | Endpoint | Result |
|--------|----------|--------|
| Delete | `DELETE /api/assets/:id` | Soft delete (90hr window) |
| Restore | `PUT /api/assets/:id/restore` | Recover file ✅ |
| Auto-Clean | Cron (every 6hrs) | Permanent delete after 90hrs |

**Perfect safety net for users! 🎯**

---

**Bilkul perfect flow! Users ke pass 90 hours ka time hai recover karne ke liye! 🔥**
