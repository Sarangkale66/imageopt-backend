# Direct Upload via Form-Data

## ✅ **Feature Complete!**

You can now upload files directly from frontend using **multipart/form-data** instead of presigned URLs!

---

## 🚀 How to Use

### Postman Example

**Endpoint**: `POST /api/assets/direct-upload`

**Setup**:
1. Select `POST` method
2. URL: `http://localhost:5000/api/assets/direct-upload`
3. Headers:
   - `Authorization: Bearer YOUR_JWT_TOKEN`
4. Body → Select `form-data`:
   - Add key `file` (type: File) → Select your image
   - Add key `folder` (type: Text) → `products` (optional)
   - Add key `customFileName` (type: Text) → `laptop.jpg` (optional)

**Send** → File uploads to S3 automatically!

---

## 📋 Form-Data Fields

| Field | Type | Required | Description | Example |
|-------|------|----------|-------------|---------|
| `file` | File | ✅ Yes | Image/video file | `image.jpg` |
| `folder` | Text | ❌ No | Custom folder | `products` |
| `customFileName` | Text | ❌ No | Custom filename | `laptop.jpg` |

---

## 🔄 Two Upload Methods Now Available



### Method 1: Presigned URL (Existing)
**Best for**: Large files, client-side control

```javascript
// 1. Get presigned URL
const { uploadUrl, s3Key } = await fetch('/api/assets/upload-url', {
  method: 'POST',
  headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
  body: JSON.stringify({ fileName: 'image.jpg', fileType: 'image/jpeg', fileSize: 1048576 })
}).then(r => r.json());

// 2. Upload to S3 directly
await fetch(uploadUrl, {
  method: 'PUT',
  body: file,
  headers: { 'Content-Type': file.type }
});

// 3. Save metadata
await fetch('/api/assets', {
  method: 'POST',
  headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
  body: JSON.stringify({ fileName, fileType, fileSize, s3Key, s3Bucket })
});
```

### Method 2: Direct Upload (**NEW!** ✨)
**Best for**: Simplicity, small-medium files

```javascript
const formData = new FormData();
formData.append('file', file);
formData.append('folder', 'products');
formData.append('customFileName', 'laptop.jpg');

const response = await fetch('/api/assets/direct-upload', {
  method: 'POST',
  headers: { 'Authorization': `Bearer ${token}` },
  body: formData
});

const { asset, s3Key, cloudfrontUrl } = await response.json();
// Done! File is on S3 and saved in DB
```

---

## 🎯 React Example

```tsx
const DirectUpload: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [folder, setFolder] = useState('products');
  const [customFileName, setCustomFileName] = useState('');
  const [uploading, setUploading] = useState(false);

  const handleUpload = async () => {
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);
    if (folder) formData.append('folder', folder);
    if (customFileName) formData.append('customFileName', customFileName);

    try {
      const response = await fetch('http://localhost:5000/api/assets/direct-upload', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: formData
      });

      const data = await response.json();
      console.log('Uploaded!', data);
      alert(`File uploaded! CloudFront URL: ${data.data.cloudfrontUrl}`);
    } catch (error) {
      console.error('Upload failed:', error);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div>
      <input type="file" onChange={(e) => setFile(e.target.files?.[0] || null)} />
      <input 
        type="text" 
        placeholder="Folder (optional)" 
        value={folder}
        onChange={(e) => setFolder(e.target.value)}
      />
      <input 
        type="text" 
        placeholder="Custom filename (optional)" 
        value={customFileName}
        onChange={(e) => setCustomFileName(e.target.value)}
      />
      <button onClick={handleUpload} disabled={!file || uploading}>
        {uploading ? 'Uploading...' : 'Upload'}
      </button>
    </div>
  );
};
```

---

## 📝 curl Example

```bash
curl -X POST http://localhost:5000/api/assets/direct-upload \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "file=@/path/to/image.jpg" \
  -F "folder=products" \
  -F "customFileName=laptop.jpg"
```

---

## ✅ Response

```json
{
  "success": true,
  "message": "File uploaded successfully to S3",
  "data": {
    "asset": {
      "_id": "67654abc...",
      "name": "laptop.jpg",
      "s3Key": "67653xyz.../products/laptop.jpg",
      "cloudfrontUrl": "https://d123.cloudfront.net/67653xyz.../products/laptop.jpg",
      "sizeBytes": 1048576,
      "type": "image"
    },
    "s3Key": "67653xyz.../products/laptop.jpg",
    "cloudfrontUrl": "https://d123.cloudfront.net/67653xyz.../products/laptop.jpg"
  }
}
```

---

## 🔒 Features

✅ **Direct S3 upload** - Backend handles everything  
✅ **Form-data support** - Easy frontend integration  
✅ **Auto metadata save** - Saves to MongoDB automatically  
✅ **Custom folders & filenames** - Same as presigned URL method  
✅ **File validation** - Only images/videos allowed  
✅ **Size limit** - 50MB max (configurable)  
✅ **Multer** - Efficient file handling

---

## ⚖️ When to Use Which Method?

| Feature | Presigned URL | Direct Upload |
|---------|--------------|---------------|
| **Simplicity** | ⭐⭐ | ⭐⭐⭐⭐⭐ |
| **Large files (>50MB)** | ⭐⭐⭐⭐⭐ | ⭐⭐ |
| **Server load** | Low ✅ | Higher ⚠️ |
| **Client control** | Full ✅ | Limited |
| **Code complexity** | 3 steps | 1 step ✅ |
| **Best for** | Production | Prototyping |

---

## 🎉 Try It Now!

1. **Get JWT token**: Register or login
2. **Open Postman**
3. **Create new request**:
   - Method: `POST`
   - URL: `http://localhost:5000/api/assets/direct-upload`
   - Auth: Bearer Token (paste your JWT)
   - Body: form-data
     - `file`: [Select image]
     - `folder`: `products`
     - `customFileName`: `test-upload.jpg`
4. **Send** → Check response for S3 key and CloudFront URL!

---

**Ab bahut simple ho gaya! 🚀**
