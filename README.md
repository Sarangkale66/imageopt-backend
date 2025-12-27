# ImageOpt Backend API

Prototype backend API for the multi-region image optimization platform with user authentication, asset management, and bandwidth analytics.

## 🚀 Quick Start

### 1. Install Dependencies
```bash
cd backend
npm install
```

### 2. Configure Environment
```bash
cp .env.example .env
# Edit .env with your configuration
```

Required environment variables:
- `MONGODB_URI` - MongoDB connection string
- `JWT_SECRET` - Secret key for JWT tokens
- `AWS_ACCESS_KEY_ID` - AWS credentials
- `AWS_SECRET_ACCESS_KEY` - AWS credentials
- `S3_ORIGINAL_BUCKET` - S3 bucket name for original images
- `CLOUDFRONT_DOMAIN` - CloudFront distribution domain

### 3. Run Development Server
```bash
npm run dev
```

The server will start at `http://localhost:5000`

### 4. Build for Production
```bash
npm run build
npm start
```

---

## 📚 API Endpoints

### Authentication

#### Register User
```http
POST /api/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

Response:
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": { ... },
    "token": "eyJhbGciOiJIUzI1NiIs..."
  }
}
```

#### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

#### Get Current User
```http
GET /api/auth/me
Authorization: Bearer YOUR_JWT_TOKEN
```

---

### Assets

#### Generate Upload URL
```http
POST /api/assets/upload-url
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json

{
  "fileName": "image.jpg",
  "fileType": "image/jpeg",
  "fileSize": 1048576
}
```

Response:
```json
{
  "success": true,
  "data": {
    "uploadUrl": "https://s3.amazonaws.com/...",
    "s3Key": "users/123/image.jpg",
    "s3Bucket": "imageopt-original-...",
    "expiresIn": 900
  }
}
```

**Upload Flow**:
1. Get presigned URL from backend
2. Upload file directly to S3 using the presigned URL (PUT request)
3. Save asset metadata to backend

#### Create Asset Metadata
```http
POST /api/assets
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json

{
  "fileName": "image.jpg",
  "fileType": "image/jpeg",
  "fileSize": 1048576,
  "s3Key": "users/123/image.jpg",
  "s3Bucket": "imageopt-original-...",
  "metadata": {
    "width": 1920,
    "height": 1080,
    "format": "jpeg"
  }
}
```

#### List User Assets
```http
GET /api/assets?page=1&limit=20
Authorization: Bearer YOUR_JWT_TOKEN
```

#### Get Asset Details
```http
GET /api/assets/:id
Authorization: Bearer YOUR_JWT_TOKEN
```

#### Get Asset Bandwidth Stats
```http
GET /api/assets/:id/stats
Authorization: Bearer YOUR_JWT_TOKEN
```

Response:
```json
{
  "success": true,
  "data": {
    "asset": {
      "id": "...",
      "name": "image.jpg",
      "cloudfrontUrl": "https://d123.cloudfront.net/..."
    },
    "stats": {
      "totalBandwidthBytes": 52345678,
      "totalBandwidthMB": "49.92",
      "totalRequests": 1523,
      "cacheHitRatio": "87.50%"
    }
  }
}
```

#### Delete Asset
```http
DELETE /api/assets/:id
Authorization: Bearer YOUR_JWT_TOKEN
```

---

## 🗂️ Project Structure

```
backend/
├── src/
│   ├── auth/                 # Authentication module
│   │   ├── auth.controller.ts
│   │   ├── auth.service.ts
│   │   ├── auth.routes.ts
│   │   └── dto/
│   ├── users/                # User module
│   │   ├── user.model.ts
│   │   └── user.service.ts
│   ├── assets/               # Asset management
│   │   ├── asset.model.ts
│   │   ├── asset-log.model.ts
│   │   ├── asset.controller.ts
│   │   ├── asset.service.ts
│   │   ├── asset.routes.ts
│   │   └── dto/
│   ├── aws/                  # AWS integrations
│   │   └── s3.service.ts
│   ├── middlewares/          # Express middlewares
│   │   ├── auth.middleware.ts
│   │   └── error.middleware.ts
│   ├── utils/                # Utilities
│   │   ├── jwt.util.ts
│   │   └── response.util.ts
│   ├── config/               # Configuration
│   │   ├── env.ts
│   │   └── database.ts
│   ├── types/                # TypeScript types
│   │   └── express.d.ts
│   ├── app.ts                # Express app setup
│   └── server.ts             # Server entry point
├── .env.example              # Environment template
├── .gitignore
├── package.json
├── tsconfig.json
└── README.md
```

---

## 🗄️ Data Models

### User
```typescript
{
  email: string
  passwordHash: string
  role: "admin" | "user"
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}
```

### Asset
```typescript
{
  ownerId: ObjectId
  name: string
  type: "image" | "video" | "file"
  s3Bucket: string
  s3Key: string
  cloudfrontUrl: string
  sizeBytes: number
  metadata: {
    width?: number
    height?: number
    format?: string
  }
  isDeleted: boolean
  createdAt: Date
  updatedAt: Date
}
```

### AssetLog (bandwidth_logs collection)
```typescript
{
  assetId: ObjectId
  path: string
  bytes: number
  edgeResult: "Hit" | "Miss" | "Error"
  clientIp: string
  country: string
  timestamp: Date
}
```

---

## 🔧 Development

### Run in Development Mode
```bash
npm run dev
```

Uses `tsx watch` for hot-reload on file changes.

### Build TypeScript
```bash
npm run build
```

Compiles TypeScript to `dist/` directory.

### Run Production
```bash
npm start
```

---

## 🧪 Testing

### Test with curl

**Register**:
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'
```

**Login**:
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'
```

**Get Upload URL**:
```bash
curl -X POST http://localhost:5000/api/assets/upload-url \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"fileName":"test.jpg","fileType":"image/jpeg","fileSize":1048576}'
```

---

## 🔐 Security Notes

### Prototype Version
- JWT stored in Authorization header (Bearer token)
- CORS allows all origins (`*`)
- bcrypt rounds: 10
- Presigned URL expiry: 15 minutes

### Production Hardening (TODO)
- [ ] Add rate limiting (express-rate-limit)
- [ ] Implement refresh tokens
- [ ] Restrict CORS to specific domains
- [ ] Add request validation (Zod/Joi)
- [ ] Setup proper logging (Winston/Pino)
- [ ] Add monitoring (Datadog/New Relic)
- [ ] Implement file type validation
- [ ] Add virus scanning for uploads
- [ ] Setup AWS WAF for API

---

## 📊 CloudFront Integration

This backend integrates with your existing CloudFront real-time logs pipeline:

```
CloudFront → Kinesis → Lambda (bandwidth-processor) → MongoDB (bandwidth_logs)
                                                          ↓
                                          Backend API queries this collection
```

The `AssetLog` model connects to the existing `bandwidth_logs` collection from Phase 4.

**To enable asset tracking in logs**, update the Lambda function to:
1. Query MongoDB for asset by path
2. Store `assetId` in bandwidth_logs

---

## 🚀 Deployment

### Option 1: AWS EC2
```bash
# On EC2 instance
git clone <repo>
cd backend
npm install
npm run build
pm2 start dist/server.js --name imageopt-api
```

### Option 2: Docker
```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY dist ./dist
CMD ["node", "dist/server.js"]
```

### Option 3: AWS Lambda (with Express adapter)
Use `@vendia/serverless-express` to run Express on Lambda.

---

## 📝 License

MIT
#   i m a g e o p t - b a c k e n d  
 