# Postman & cURL Examples - Direct Upload

## 🔥 Quick Test Commands

### 1. Health Check
```bash
curl http://localhost:5000/health
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

**Save the token from response!**

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

### 4. Direct Upload (Form-Data) ⭐

```bash
curl -X POST http://localhost:5000/api/assets/direct-upload \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -F "file=@C:\path\to\image.jpg" \
  -F "folder=products" \
  -F "customFileName=laptop-macbook-pro.jpg"
```

**Response**:
```json
{
  "success": true,
  "message": "File uploaded successfully to S3",
  "data": {
    "asset": {
      "_id": "67654abc123",
      "name": "laptop-macbook-pro.jpg",
      "s3Key": "67654abc123/products/laptop-macbook-pro.jpg",
      "cloudfrontUrl": "https://d123.cloudfront.net/67654abc123/products/laptop-macbook-pro.jpg",
      "sizeBytes": 1048576,
      "type": "image"
    },
    "s3Key": "67654abc123/products/laptop-macbook-pro.jpg",
    "cloudfrontUrl": "https://d123.cloudfront.net/67654abc123/products/laptop-macbook-pro.jpg"
  }
}
```

---

### 5. Windows PowerShell Version

```powershell
# Save token
$token = "YOUR_JWT_TOKEN_HERE"

# Upload file
$response = Invoke-RestMethod -Uri "http://localhost:5000/api/assets/direct-upload" `
  -Method POST `
  -Headers @{ "Authorization" = "Bearer $token" } `
  -Form @{
    file = Get-Item "C:\path\to\image.jpg"
    folder = "products"
    customFileName = "laptop.jpg"
  }

# Show response
$response | ConvertTo-Json -Depth 5
```

---

### 6. List Uploaded Assets
```bash
curl http://localhost:5000/api/assets \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

## 📦 Postman Setup

### Collection Import
Already have the collection! Just update the "Get Upload URL" request.

### Manual Setup

**1. Create New Request**
- Name: `Direct Upload`
- Method: `POST`
- URL: `{{baseUrl}}/api/assets/direct-upload`

**2. Authorization Tab**
- Type: `Bearer Token`
- Token: `{{token}}` (auto-filled after login)

**3. Body Tab**
- Select: `form-data`
- Add fields:

| KEY | VALUE | TYPE |
|-----|-------|------|
| `file` | [Select File] | File |
| `folder` | `products` | Text |
| `customFileName` | `laptop.jpg` | Text |

**4. Send** ✅

---

## 🎯 S3 Key Pattern

### NEW Pattern: `/assetId/{userFolder}/{filename}`

**Example**:
```
67654abc123/products/laptop-macbook-pro.jpg
├─ assetId: 67654abc123 (MongoDB _id)
├─ userFolder: products (from form-data)
└─ filename: laptop-macbook-pro.jpg (custom or original)
```

**CloudFront URL**:
```
https://d123.cloudfront.net/67654abc123/products/laptop-macbook-pro.jpg
```

---

## 🔄 Complete Test Flow (PowerShell)

```powershell
# 1. Register
$registerResponse = Invoke-RestMethod -Uri "http://localhost:5000/api/auth/register" `
  -Method POST `
  -ContentType "application/json" `
  -Body '{"email":"test2@example.com","password":"password123"}'

$token = $registerResponse.data.token
Write-Host "✅ Token: $token" -ForegroundColor Green

# 2. Upload image
$uploadResponse = Invoke-RestMethod -Uri "http://localhost:5000/api/assets/direct-upload" `
  -Method POST `
  -Headers @{ "Authorization" = "Bearer $token" } `
  -Form @{
    file = Get-Item "C:\Users\saran\Desktop\test-image.jpg"
    folder = "products"
    customFileName = "laptop.jpg"
  }

Write-Host "✅ Uploaded!" -ForegroundColor Green
Write-Host "S3 Key: $($uploadResponse.data.s3Key)" -ForegroundColor Yellow
Write-Host "CloudFront URL: $($uploadResponse.data.cloudfrontUrl)" -ForegroundColor Cyan

# 3. List assets
$assetsResponse = Invoke-RestMethod -Uri "http://localhost:5000/api/assets" `
  -Headers @{ "Authorization" = "Bearer $token" }

Write-Host "✅ Total Assets: $($assetsResponse.data.pagination.total)" -ForegroundColor Green
$assetsResponse.data.assets | ForEach-Object {
  Write-Host "  - $($_.name) → $($_.s3Key)" -ForegroundColor White
}
```

---

## 📋 Field Reference

### Required Fields
- `file` (File) - The image/video to upload

### Optional Fields  
- `folder` (Text) - Custom folder name (e.g., `products`, `blog/2025`)
- `customFileName` (Text) - Custom filename with extension (e.g., `laptop.jpg`)

### Examples

**Basic Upload**:
```bash
curl -X POST http://localhost:5000/api/assets/direct-upload \
  -H "Authorization: Bearer TOKEN" \
  -F "file=@image.jpg"
```
→ S3 Key: `{assetId}/users/{userId}/{timestamp}-{random}.jpg`

**With Folder**:
```bash
curl -X POST http://localhost:5000/api/assets/direct-upload \
  -H "Authorization: Bearer TOKEN" \
  -F "file=@image.jpg" \
  -F "folder=products"
```
→ S3 Key: `{assetId}/products/{timestamp}-{random}.jpg`

**Full Control**:
```bash
curl -X POST http://localhost:5000/api/assets/direct-upload \
  -H "Authorization: Bearer TOKEN" \
  -F "file=@image.jpg" \
  -F "folder=products" \
  -F "customFileName=laptop.jpg"
```
→ S3 Key: `{assetId}/products/laptop.jpg`

---

## ✅ Success Response
```json
{
  "success": true,
  "message": "File uploaded successfully to S3",
  "data": {
    "asset": {
      "_id": "67654abc123",
      "ownerId": "67653xyz456",
      "name": "laptop.jpg",
      "type": "image",
      "s3Bucket": "imageopt-original-329599656829-us-east-1",
      "s3Key": "67654abc123/products/laptop.jpg",
      "cloudfrontUrl": "https://d123.cloudfront.net/67654abc123/products/laptop.jpg",
      "sizeBytes": 1048576,
      "createdAt": "2025-12-27T01:42:00.000Z"
    },
    "s3Key": "67654abc123/products/laptop.jpg",
    "cloudfrontUrl": "https://d123.cloudfront.net/67654abc123/products/laptop.jpg"
  }
}
```

---

## 🐛 Troubleshooting

### Error: "No token provided"
→ Add Authorization header with Bearer token

### Error: "No file uploaded"
→ Make sure field name is `file` and type is File

### Error: "Cannot find module multer"
→ Run: `npm install multer @types/multer`

### File too large
→ Current limit: 50MB. Edit `upload.middleware.ts` to increase

---

**Ab test karo! 🚀**
