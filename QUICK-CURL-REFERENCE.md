# 🚀 Quick cURL Reference

## Complete Test Flow

### 1️⃣ Register
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'
```

**Response**: Copy the `token` value!

---

### 2️⃣ Direct Upload with Form-Data ⭐
```bash
curl -X POST http://localhost:5000/api/assets/direct-upload \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -F "file=@C:\Users\saran\Desktop\image.jpg" \
  -F "folder=products" \
  -F "customFileName=laptop.jpg"
```

**Windows PowerShell**:
```powershell
curl.exe -X POST http://localhost:5000/api/assets/direct-upload `
  -H "Authorization: Bearer YOUR_TOKEN" `
  -F "file=@C:\Users\saran\Desktop\image.jpg" `
  -F "folder=products" `
  -F "customFileName=laptop.jpg"
```

---

### 3️⃣ List Assets
```bash
curl http://localhost:5000/api/assets \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## S3 Key Pattern

### Current Pattern
```
{assetId}/{userFolder}/{filename}
```

**Example**:
```
67654abc123/products/laptop.jpg
├─ assetId: 67654abc123 (MongoDB _id)
├─ folder: products (user input)
└─ filename: laptop.jpg (user input)
```

**CloudFront URL**:
```
https://d123.cloudfront.net/67654abc123/products/laptop.jpg
```

---

## PowerShell Full Example

```powershell
# 1. Register and get token
$response = Invoke-RestMethod -Uri "http://localhost:5000/api/auth/register" `
  -Method POST `
  -ContentType "application/json" `
  -Body '{"email":"test3@example.com","password":"password123"}'

$token = $response.data.token
Write-Host "Token: $token" -ForegroundColor Green

# 2. Upload file directly
$uploadRes = Invoke-RestMethod -Uri "http://localhost:5000/api/assets/direct-upload" `
  -Method POST `
  -Headers @{ "Authorization" = "Bearer $token" } `
  -Form @{
    file = Get-Item "C:\Users\saran\Desktop\test.jpg"
    folder = "products"
    customFileName = "laptop.jpg"
  }

Write-Host "✅ Uploaded!" -ForegroundColor Green
Write-Host "Asset ID: $($uploadRes.data.asset._id)" -ForegroundColor Yellow
Write-Host "S3 Key: $($uploadRes.data.s3Key)" -ForegroundColor Cyan
Write-Host "CloudFront URL: $($uploadRes.data.cloudfrontUrl)" -ForegroundColor Magenta

# 3. Get asset stats
$assetId = $uploadRes.data.asset._id
$stats = Invoke-RestMethod -Uri "http://localhost:5000/api/assets/$assetId/stats" `
  -Headers @{ "Authorization" = "Bearer $token" }

Write-Host "Bandwidth Stats: $($stats.data.stats | ConvertTo-Json)" -ForegroundColor White
```

---

## Postman Setup

### Import Collection
1. Import `ImageOpt-API.postman_collection.json`
2. Collection has auto-save token scripts ✅

### Or Create Manually

**Request Setup**:
- Method: `POST`
- URL: `http://localhost:5000/api/assets/direct-upload`
- Auth → Type: `Bearer Token` → Token: `{{token}}`
- Body → `form-data`:

| Key | Value | Type |
|-----|-------|------|
| file | [Browse &Select] | File |
| folder | products | Text |
| customFileName | laptop.jpg | Text |

**Click Send** → Done! ✅

---

## Response Example

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
      "s3Key": "67654abc12345/products/laptop.jpg",
      "cloudfrontUrl": "https://d123.cloudfront.net/67654abc12345/products/laptop.jpg",
      "sizeBytes": 1048576,
      "createdAt": "2025-12-27T01:42:25.000Z",
      "updatedAt": "2025-12-27T01:42:25.000Z"
    },
    "s3Key": "67654abc12345/products/laptop.jpg",
    "cloudfrontUrl": "https://d123.cloudfront.net/67654abc12345/products/laptop.jpg"
  }
}
```

---

## Test Commands

```bash
# Health check
curl http://localhost:5000/health

# Register
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"user@test.com","password":"pass123"}'

# Login  
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@test.com","password":"pass123"}'

# Upload (replace TOKEN and FILE_PATH)
curl -X POST http://localhost:5000/api/assets/direct-upload \
  -H "Authorization: Bearer TOKEN" \
  -F "file=@/path/to/file.jpg" \
  -F "folder=my-folder" \
  -F "customFileName=my-image.jpg"

# List assets
curl http://localhost:5000/api/assets \
  -H "Authorization: Bearer TOKEN"

# Get single asset (replace ASSET_ID)
curl http://localhost:5000/api/assets/ASSET_ID \
  -H"Authorization: Bearer TOKEN"

# Get bandwidth stats
curl http://localhost:5000/api/assets/ASSET_ID/stats \
  -H "Authorization: Bearer TOKEN"

# Delete asset
curl -X DELETE http://localhost:5000/api/assets/ASSET_ID \
  -H "Authorization: Bearer TOKEN"
```

---

**Ab test karo bhai! 🎯**
