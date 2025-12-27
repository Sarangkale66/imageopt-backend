# API Testing Guide - cURL & Postman

## 📦 Postman Collection

**Import the collection**: [`ImageOpt-API.postman_collection.json`](file:///c:/Users/saran/OneDrive/Desktop/image-optimization%20with%20regional%20ec2%20with%202CF%20with%20activity%20logs%20in%20mongodb/backend/ImageOpt-API.postman_collection.json)

1. Open Postman
2. Click "Import" → Select the JSON file
3. The collection includes auto-save token scripts!

---

## 🧪 cURL Commands

### 1. Health Check
```bash
curl http://localhost:5000/health
```

**Expected Response:**
```json
{
  "status": "healthy",
  "service": "imageopt-backend-api",
  "version": "1.0.0",
  "timestamp": "2025-12-27T01:16:26.000Z"
}
```

---

### 2. Register User
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
  "email": "test@example.com",
  "password": "password123"
}'
```

**Expected Response:**
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": {
      "_id": "...",
      "email": "test@example.com",
      "role": "user",
      "isActive": true
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

**Save the token** - you'll need it for next requests!

---

### 3. Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
  "email": "test@example.com",
  "password": "password123"
}'
```

---

### 4. Get Current User
```bash
# Replace YOUR_JWT_TOKEN with the token from login/register
curl http://localhost:5000/api/auth/me \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "_id": "...",
      "email": "test@example.com",
      "role": "user",
      "isActive": true,
      "createdAt": "2025-12-27T01:16:26.000Z"
    }
  }
}
```

---

### 5. Get Upload URL
```bash
curl -X POST http://localhost:5000/api/assets/upload-url \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
  "fileName": "test-image.jpg",
  "fileType": "image/jpeg",
  "fileSize": 1048576
}'
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Upload URL generated successfully",
  "data": {
    "uploadUrl": "https://imageopt-original-329599656829-us-east-1.s3.amazonaws.com/users/...",
    "s3Key": "users/67653abc.../1735259786000-abc123.jpg",
    "s3Bucket": "imageopt-original-329599656829-us-east-1",
    "expiresIn": 900
  }
}
```

---

### 6. Upload File to S3 (Use the presigned URL)
```bash
# Copy the uploadUrl from previous response
curl -X PUT "PRESIGNED_URL_FROM_STEP_5" \
  -H "Content-Type: image/jpeg" \
  --data-binary "@C:\path\to\your\image.jpg"
```

**Expected**: HTTP 200 OK (no JSON response from S3)

---

### 7. Save Asset Metadata
```bash
# Use s3Key and s3Bucket from step 5
curl -X POST http://localhost:5000/api/assets \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
  "fileName": "test-image.jpg",
  "fileType": "image/jpeg",
  "fileSize": 1048576,
  "s3Key": "users/67653abc.../1735259786000-abc123.jpg",
  "s3Bucket": "imageopt-original-329599656829-us-east-1",
  "metadata": {
    "width": 1920,
    "height": 1080,
    "format": "jpeg"
  }
}'
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Asset created successfully",
  "data": {
    "asset": {
      "_id": "67653def...",
      "ownerId": "...",
      "name": "test-image.jpg",
      "type": "image",
      "s3Key": "users/.../image.jpg",
      "cloudfrontUrl": "https://d123abc.cloudfront.net/users/.../image.jpg",
      "sizeBytes": 1048576,
      "metadata": { "width": 1920, "height": 1080 }
    }
  }
}
```

---

### 8. List User's Assets
```bash
curl http://localhost:5000/api/assets?page=1&limit=20 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

### 9. Get Asset Details
```bash
# Replace ASSET_ID with _id from create asset response
curl http://localhost:5000/api/assets/ASSET_ID \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

### 10. Get Asset Bandwidth Stats
```bash
curl http://localhost:5000/api/assets/ASSET_ID/stats \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "asset": {
      "id": "...",
      "name": "test-image.jpg",
      "cloudfrontUrl": "https://d123abc.cloudfront.net/..."
    },
    "stats": {
      "totalBandwidthBytes": 0,
      "totalBandwidthMB": "0.00",
      "totalRequests": 0,
      "cacheHitRatio": "0.00%"
    }
  }
}
```

---

### 11. Delete Asset
```bash
curl -X DELETE http://localhost:5000/api/assets/ASSET_ID \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

## 🔄 Complete Test Flow

```bash
# 1. Health check
curl http://localhost:5000/health

# 2. Register
TOKEN=$(curl -s -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}' \
  | jq -r '.data.token')

echo "Token: $TOKEN"

# 3. Get upload URL
UPLOAD_DATA=$(curl -s -X POST http://localhost:5000/api/assets/upload-url \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"fileName":"test.jpg","fileType":"image/jpeg","fileSize":1048576}')

echo $UPLOAD_DATA | jq .

UPLOAD_URL=$(echo $UPLOAD_DATA | jq -r '.data.uploadUrl')
S3_KEY=$(echo $UPLOAD_DATA | jq -r '.data.s3Key')
S3_BUCKET=$(echo $UPLOAD_DATA | jq -r '.data.s3Bucket')

# 4. Upload file (replace with your file path)
curl -X PUT "$UPLOAD_URL" \
  -H "Content-Type: image/jpeg" \
  --data-binary "@path/to/image.jpg"

# 5. Save asset metadata
ASSET_ID=$(curl -s -X POST http://localhost:5000/api/assets \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"fileName\":\"test.jpg\",
    \"fileType\":\"image/jpeg\",
    \"fileSize\":1048576,
    \"s3Key\":\"$S3_KEY\",
    \"s3Bucket\":\"$S3_BUCKET\"
  }" | jq -r '.data.asset._id')

echo "Asset ID: $ASSET_ID"

# 6. List assets
curl http://localhost:5000/api/assets \
  -H "Authorization: Bearer $TOKEN" | jq .
```

---

## 🪟 PowerShell Version

```powershell
# 1. Health check
Invoke-RestMethod -Uri "http://localhost:5000/health"

# 2. Register
$registerResponse = Invoke-RestMethod -Uri "http://localhost:5000/api/auth/register" `
  -Method POST `
  -ContentType "application/json" `
  -Body '{"email":"test@example.com","password":"password123"}'

$token = $registerResponse.data.token
Write-Host "Token: $token"

# 3. Get upload URL
$uploadUrlResponse = Invoke-RestMethod -Uri "http://localhost:5000/api/assets/upload-url" `
  -Method POST `
  -Headers @{ "Authorization" = "Bearer $token" } `
  -ContentType "application/json" `
  -Body '{"fileName":"test.jpg","fileType":"image/jpeg","fileSize":1048576}'

$uploadUrl = $uploadUrlResponse.data.uploadUrl
$s3Key = $uploadUrlResponse.data.s3Key
$s3Bucket = $uploadUrlResponse.data.s3Bucket

Write-Host "Upload URL: $uploadUrl"
Write-Host "S3 Key: $s3Key"

# 4. Upload file
$fileBytes = [System.IO.File]::ReadAllBytes("C:\path\to\image.jpg")
Invoke-RestMethod -Uri $uploadUrl `
  -Method PUT `
  -Body $fileBytes `
  -Headers @{ "Content-Type" = "image/jpeg" }

# 5. Save asset
$assetBody = @{
  fileName = "test.jpg"
  fileType = "image/jpeg"
  fileSize = 1048576
  s3Key = $s3Key
  s3Bucket = $s3Bucket
  metadata = @{
    width = 1920
    height = 1080
  }
} | ConvertTo-Json

$assetResponse = Invoke-RestMethod -Uri "http://localhost:5000/api/assets" `
  -Method POST `
  -Headers @{ 
    "Authorization" = "Bearer $token"
    "Content-Type" = "application/json"
  } `
  -Body $assetBody

$assetId = $assetResponse.data.asset._id
Write-Host "Asset ID: $assetId"

# 6. List assets
Invoke-RestMethod -Uri "http://localhost:5000/api/assets" `
  -Headers @{ "Authorization" = "Bearer $token" }
```

---

## 🐛 Troubleshooting

### Error: "Connection refused"
- Check if backend is running: `npm run dev`
- Verify port 5000 is not blocked

### Error: "Invalid or expired token"
- Token expires after 7 days
- Login again to get new token

### Error: "Not authenticated"
- Missing Authorization header
- Token format must be: `Bearer YOUR_TOKEN`

### Error: "Access Denied" (S3)
- Run permission test: `npx tsx test-s3-permissions.ts`
- Check AWS credentials in `.env`

---

## 📝 Environment Setup

Make sure your `.env` has these variables:

```bash
PORT=5000
MONGODB_URI=mongodb+srv://...
JWT_SECRET=your-secret-key
AWS_ACCESS_KEY_ID=AKIA...
AWS_SECRET_ACCESS_KEY=...
S3_ORIGINAL_BUCKET=imageopt-original-329599656829-us-east-1
CLOUDFRONT_DOMAIN=d123abc.cloudfront.net
```

---

## ✅ Expected Flow

1. ✅ Register/Login → Get JWT token
2. ✅ Request upload URL → Get presigned S3 URL
3. ✅ Upload file to S3 → Direct PUT to S3
4. ✅ Save metadata → Backend records asset
5. ✅ List/View assets → Query your uploads
6. ✅ View stats → See bandwidth usage (after CloudFront requests)
