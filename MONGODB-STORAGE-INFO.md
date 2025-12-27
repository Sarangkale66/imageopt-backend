# MongoDB Asset Storage - Complete Info

## ✅ **What Gets Saved in MongoDB**

Har file upload par ye sab information **automatically MongoDB mein save** hoti hai:

### Asset Collection Schema

```typescript
{
  _id: ObjectId,                    // Auto-generated MongoDB ID
  ownerId: ObjectId,                // User ki ID (ref: User collection)
  name: string,                     // Filename
  type: "image" | "video" | "file", // File type
  s3Bucket: string,                 // S3 bucket name
  s3Key: string,                    // Complete S3 path
  cloudfrontUrl: string,            // CloudFront CDN URL
  sizeBytes: number,                // Actual file size in bytes
  metadata: {                       // Optional metadata
    width?: number,                 // Image width
    height?: number,                // Image height
    format?: string                 // Image format (jpeg, png, etc.)
  },
  isDeleted: boolean,               // Soft delete flag (default: false)
  createdAt: Date,                  // Upload timestamp
  updatedAt: Date                   // Last update timestamp
}
```

---

## 📝 **Example MongoDB Document**

```json
{
  "_id": "67654abc12345",
  "ownerId": "67653xyz98765",
  "name": "laptop-macbook-pro.jpg",
  "type": "image",
  "s3Bucket": "imageopt-original-329599656829-us-east-1",
  "s3Key": "67653xyz98765/products/laptop-macbook-pro.jpg",
  "cloudfrontUrl": "https://d123.cloudfront.net/67653xyz98765/products/laptop-macbook-pro.jpg",
  "sizeBytes": 1572864,
  "metadata": {
    "width": 1920,
    "height": 1080,
    "format": "jpeg"
  },
  "isDeleted": false,
  "createdAt": "2025-12-27T01:45:30.123Z",
  "updatedAt": "2025-12-27T01:45:30.123Z"
}
```

---

## 🔍 **How It Works**

### 1. Upload Flow
```javascript
// In directUpload controller method
const asset = await this.assetService.create(
  req.user.userId,              // ✅ Owner ID
  customFileName || file.originalname,  // ✅ Name
  assetType,                    // ✅ Type (image/video/file)
  s3Bucket,                     // ✅ S3 Bucket
  s3Key,                        // ✅ S3 Key (full path)
  cloudfrontUrl,                // ✅ CloudFront URL
  file.size                     // ✅ Size in bytes
);
```

### 2. Data Saved
| Field | Source | Example |
|-------|--------|---------|
| `name` | User input or original filename | `laptop.jpg` |
| `type` | Auto-detected from MIME type | `image` |
| `s3Bucket` | Environment variable | `imageopt-original-...` |
| `s3Key` | Generated path | `userId/folder/filename` |
| `cloudfrontUrl` | Generated from S3 key | `https://d123.cloudfront.net/...` |
| `sizeBytes` | From uploaded file | `1572864` |
| `ownerId` | JWT token user ID | `67653xyz...` |
| `createdAt` | Auto (Mongoose) | `2025-12-27T...` |

---

## 🗄️ **MongoDB Indexes**

For fast queries, these indexes are created:

```typescript
// Compound index for user's active assets
{ ownerId: 1, isDeleted: 1 }

// Unique index on S3 key
{ s3Key: 1 }  // Prevents duplicate uploads

// Sort index for listing
{ createdAt: -1 }
```

---

## 📊 **Query Examples**

### Get all user's assets
```javascript
db.assets.find({ 
  ownerId: ObjectId("67653xyz..."),
  isDeleted: false 
}).sort({ createdAt: -1 })
```

### Find by S3 key
```javascript
db.assets.findOne({ 
  s3Key: "userId/products/laptop.jpg" 
})
```

### Get total storage used
```javascript
db.assets.aggregate([
  { $match: { ownerId: ObjectId("..."), isDeleted: false } },
  { $group: { _id: null, totalBytes: { $sum: "$sizeBytes" } } }
])
```

---

## 🎯 **API Response**

Jab aap upload karte ho, ye sab data return hota hai:

```json
{
  "success": true,
  "message": "File uploaded successfully to S3",
  "data": {
    "asset": {
      "_id": "67654abc12345",
      "ownerId": "67653xyz98765",
      "name": "laptop.jpg",
      "type": "image",
      "s3Bucket": "imageopt-original-329599656829-us-east-1",
      "s3Key": "67653xyz98765/products/laptop.jpg",
      "cloudfrontUrl": "https://d123.cloudfront.net/67653xyz98765/products/laptop.jpg",
      "sizeBytes": 1572864,
      "metadata": {},
      "isDeleted": false,
      "createdAt": "2025-12-27T01:45:30.123Z",
      "updatedAt": "2025-12-27T01:45:30.123Z"
    },
    "s3Key": "67653xyz98765/products/laptop.jpg",
    "cloudfrontUrl": "https://d123.cloudfront.net/67653xyz98765/products/laptop.jpg"
  }
}
```

---

## 🔗 **Bandwidth Logs Integration**

Aapke CloudFront logs bhi MongoDB mein jaate hain (`bandwidth_logs` collection):

```json
{
  "assetId": "67654abc12345",  // Links to asset
  "path": "/67653xyz.../products/laptop.jpg",
  "bytes": 1572864,
  "edgeResult": "Hit",
  "clientIp": "103.x.x.x",
  "country": "IN",
  "timestamp": "2025-12-27T..."
}
```

**Link between collections**:
- `assets._id` === `bandwidth_logs.assetId`

---

## ✅ **Summary**

**Har upload par ye sab automatically save hota hai**:
- ✅ File size (bytes)
- ✅ File type (image/video)
- ✅ S3 bucket name
- ✅ S3 key (complete path)
- ✅ CloudFront URL
- ✅ Owner ID
- ✅ Upload timestamp
- ✅ File metadata (if provided)

**Koi manual entry ki zaroorat nahi! Sab automatic hai! 🎉**

---

## 🧪 **Test It**

Upload karo aur phir MongoDB check karo:

```javascript
// MongoDB Shell
use imageopt

// See all assets
db.assets.find().pretty()

// See latest upload
db.assets.find().sort({ createdAt: -1 }).limit(1).pretty()

// Get total files and storage
db.assets.aggregate([
  { $group: {
    _id: null,
    totalFiles: { $sum: 1 },
    totalBytes: { $sum: "$sizeBytes" },
    totalMB: { $sum: { $divide: ["$sizeBytes", 1048576] } }
  }}
])
```

**Sab data wahan hoga! ✅**
