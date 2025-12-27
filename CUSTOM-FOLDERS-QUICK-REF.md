# Custom Folder Upload - Quick Reference

## 🎯 Key Change

Users can now specify **custom folder names** and **custom filenames** for S3 uploads!

## 📝 Request Format

### Basic Request (Auto-generated path)
```json
POST /api/assets/upload-url

{
  "fileName": "photo.jpg",
  "fileType": "image/jpeg",
  "fileSize": 1048576
}
```
**S3 Key**: `users/{userId}/1735259...abc123.jpg`

### With Custom Folder
```json
{
  "fileName": "photo.jpg",
  "fileType": "image/jpeg",
  "fileSize": 1048576,
  "folder": "products"
}
```
**S3 Key**: `{userId}/products/1735259...abc123.jpg`

### With Custom Folder + Filename
```json
{
  "fileName": "photo.jpg",
  "fileType": "image/jpeg",
  "fileSize": 1048576,
  "folder": "products",
  "customFileName": "laptop-macbook-pro.jpg"
}
```
**S3 Key**: `{userId}/products/laptop-macbook-pro.jpg`

## 🚀 Use Cases

| Scenario | folder | customFileName | Result |
|----------|--------|----------------|--------|
| Auto (default) | - | - | `users/{userId}/{timestamp}-{random}.jpg` |
| Custom folder | `"products"` | - | `{userId}/products/{timestamp}-{random}.jpg` |
| Full control | `"products"` | `"laptop.jpg"` | `{userId}/products/laptop.jpg` |
| Nested folders | `"blog/2025"` | `"hero.jpg"` | `{userId}/blog/2025/hero.jpg` |

## ✅ Try It Now

**Postman**: Already updated! The collection supports new fields.

**curl Example**:
```bash
curl -X POST http://localhost:5000/api/assets/upload-url \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "fileName": "image.jpg",
    "fileType": "image/jpeg",
    "fileSize": 1048576,
    "folder": "products",
    "customFileName": "laptop.jpg"
  }'
```

## 🔒 Security

- Folder names are **sanitized** (special chars removed)
- No parent directory access (`..` removed)
- Lowercase conversion for consistency

---

**Full docs**: [`CUSTOM-FOLDERS.md`](file:///c:/Users/saran/OneDrive/Desktop/image-optimization%20with%20regional%20ec2%20with%202CF%20with%20activity%20logs%20in%20mongodb/backend/CUSTOM-FOLDERS.md)
