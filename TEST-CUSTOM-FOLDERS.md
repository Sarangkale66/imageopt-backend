# Testing Custom Folder Feature

## Test in Postman

### 1. Import Updated Collection
The Postman collection has been updated with custom folder examples.

### 2. Test Cases

#### Test 1: Default Upload (No Custom Folder)
```json
POST /api/assets/upload-url

{
  "fileName": "photo.jpg",
  "fileType": "image/jpeg",
  "fileSize": 1048576
}
```
**Expected S3 Key**: `users/{userId}/{timestamp}-{random}.jpg`

---

#### Test 2: Custom Folder Only
```json
POST /api/assets/upload-url

{
  "fileName": "product-image.jpg",
  "fileType": "image/jpeg",
  "fileSize": 2097152,
  "folder": "products"
}
```
**Expected S3 Key**: `{userId}/products/{timestamp}-{random}.jpg`

---

#### Test 3: Custom Folder + Custom Filename
```json
POST /api/assets/upload-url

{
  "fileName": "image.jpg",
  "fileType": "image/jpeg",
  "fileSize": 1572864,
  "folder": "products",
  "customFileName": "laptop-macbook-pro.jpg"
}
```
**Expected S3 Key**: `{userId}/products/laptop-macbook-pro.jpg`

---

#### Test 4: Nested Folders
```json
POST /api/assets/upload-url

{
  " FileName": "hero.jpg",
  "fileType": "image/jpeg",
  "fileSize": 1048576,
  "folder": "blog/2025-01",
  "customFileName": "new-year-post.jpg"
}
```
**Expected S3 Key**: `{userId}/blog/2025-01/new-year-post.jpg`

---

#### Test 5: Special Characters (Should be Sanitized)
```json
POST /api/assets/upload-url

{
  "fileName": "test.jpg",
  "fileType": "image/jpeg",
  "fileSize": 524288,
  "folder": "My Products/2025!",
  "customFileName": "test-product.jpg"
}
```
**Expected S3 Key**: `{userId}/my-products/2025-/test-product.jpg`

---

## PowerShell Test Script

```powershell
# Set your token
$token = "YOUR_JWT_TOKEN_HERE"

# Test 1: Default
$response1 = Invoke-RestMethod -Uri "http://localhost:5000/api/assets/upload-url" `
  -Method POST `
  -Headers @{ "Authorization" = "Bearer $token"; "Content-Type" = "application/json" } `
  -Body '{"fileName":"test1.jpg","fileType":"image/jpeg","fileSize":1048576}'

Write-Host "Test 1 - Default:" -ForegroundColor Cyan
Write-Host "S3 Key: $($response1.data.s3Key)" -ForegroundColor Yellow
Write-Host ""

# Test 2: Custom Folder
$response2 = Invoke-RestMethod -Uri "http://localhost:5000/api/assets/upload-url" `
  -Method POST `
  -Headers @{ "Authorization" = "Bearer $token"; "Content-Type" = "application/json" } `
  -Body '{"fileName":"test2.jpg","fileType":"image/jpeg","fileSize":1048576,"folder":"products"}'

Write-Host "Test 2 - Custom Folder:" -ForegroundColor Cyan
Write-Host "S3 Key: $($response2.data.s3Key)" -ForegroundColor Yellow
Write-Host ""

# Test 3: Custom Folder + Filename
$response3 = Invoke-RestMethod -Uri "http://localhost:5000/api/assets/upload-url" `
  -Method POST `
  -Headers @{ "Authorization" = "Bearer $token"; "Content-Type" = "application/json" } `
  -Body '{"fileName":"test3.jpg","fileType":"image/jpeg","fileSize":1048576,"folder":"products","customFileName":"laptop.jpg"}'

Write-Host "Test 3 - Custom Folder + Filename:" -ForegroundColor Cyan
Write-Host "S3 Key: $($response3.data.s3Key)" -ForegroundColor Yellow
Write-Host ""

# Test 4: Nested Folders
$response4 = Invoke-RestMethod -Uri "http://localhost:5000/api/assets/upload-url" `
  -Method POST `
  -Headers @{ "Authorization" = "Bearer $token"; "Content-Type" = "application/json" } `
  -Body '{"fileName":"test4.jpg","fileType":"image/jpeg","fileSize":1048576,"folder":"blog/2025","customFileName":"hero.jpg"}'

Write-Host "Test 4 - Nested Folders:" -ForegroundColor Cyan
Write-Host "S3 Key: $($response4.data.s3Key)" -ForegroundColor Yellow
Write-Host ""

Write-Host "✅ All tests completed!" -ForegroundColor Green
```

---

## Expected Results

| Test | Expected Pattern | Example |
|------|-----------------|---------|
| 1 | `users/{userId}/{timestamp}-{random}.jpg` | `users/abc123.../1735260...def456.jpg` |
| 2 | `{userId}/products/{timestamp}-{random}.jpg` | `abc123.../products/1735260...def456.jpg` |
| 3 | `{userId}/products/laptop.jpg` | `abc123.../products/laptop.jpg` |
| 4 | `{userId}/blog/2025/hero.jpg` | `abc123.../blog/2025/hero.jpg` |

---

## Verification Checklist

- [ ] Test 1: Default path works
- [ ] Test 2: Custom folder creates correct path
- [ ] Test 3: Custom filename is used
- [ ] Test 4: Nested folders work with `/`
- [ ] Test 5: Special characters are sanitized
- [ ] Upload URL is valid (starts with `https://`)
- [ ] S3 key matches expected pattern
- [ ] CloudFront URL can be generated from S3 key

---

## Common Issues

### Issue: "Cannot find module" errors
**Solution**: Run `npm install` in backend directory

### Issue: "Not authenticated"
**Solution**: Get new JWT token from login endpoint

### Issue: Special characters in folder name
**Answer**: They're automatically sanitized - this is expected behavior

### Issue: File upload fails to S3
**Solution**: Run permission test: `npx tsx test-s3-permissions.ts`

---

## Next Steps

After testing:
1. ✅ Verify all test cases pass
2. ✅ Check S3 bucket to see actual file structure
3. ✅ Test with real frontend integration
4. ✅ Update Lambda to track custom paths (if needed)
