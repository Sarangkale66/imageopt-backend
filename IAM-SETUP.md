# Backend IAM Setup Guide

## Quick Start: Test Current Permissions

Before creating new IAM resources, test if your current credentials work:

```powershell
cd backend
npx tsx test-s3-permissions.ts
```

**If all tests pass ✅**: Your current credentials work! No need to create new IAM user for now.

**If tests fail ❌**: Follow Option 1 or 2 below.

---

## Option 1: Deploy IAM Stack (Recommended)

### Step 1: Add IAM Stack to CDK App

Edit [`bin/app.ts`](file:///c:/Users/saran/OneDrive/Desktop/image-optimization%20with%20regional%20ec2%20with%202CF%20with%20activity%20logs%20in%20mongodb/bin/app.ts):

```typescript
import { BackendIamStack } from '../lib/backend-iam-stack';

// After Phase 1 stack creation
const backendIamStack = new BackendIamStack(app, 'ImageOpt-BackendIAM', {
  originalBucketName: `imageopt-original-${account}-us-east-1`,
  transformedBucketName: `imageopt-transformed-${account}-us-east-1`,
  useSecretsManager: false, // Set to true for production
  env: {
    account: account,
    region: 'us-east-1',
  },
});
```

### Step 2: Build and Deploy

```powershell
npm run build
npx cdk deploy ImageOpt-BackendIAM
```

### Step 3: Update Backend .env

Copy the outputs from the deployment:

```bash
# From CDK outputs
AWS_ACCESS_KEY_ID=AKIA...
AWS_SECRET_ACCESS_KEY=...
```

### Step 4: Test Again

```powershell
cd backend
npx tsx test-s3-permissions.ts
```

Should now show ✅ all tests passing!

---

## Option 2: Manual IAM User Creation

If you prefer AWS Console:

### Step 1: Create IAM User

1. Go to AWS Console → IAM → Users
2. Click "Create user"
3. Username: `imageopt-backend-api-user`
4. Select "Access key - Programmatic access"

### Step 2: Attach Inline Policy

Create inline policy with this JSON:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "OriginalBucketAccess",
      "Effect": "Allow",
      "Action": [
        "s3:PutObject",
        "s3:GetObject",
        "s3:DeleteObject",
        "s3:ListBucket",
        "s3:PutObjectAcl"
      ],
      "Resource": [
        "arn:aws:s3:::imageopt-original-329599656829-us-east-1",
        "arn:aws:s3:::imageopt-original-329599656829-us-east-1/*"
      ]
    },
    {
      "Sid": "TransformedBucketReadAccess",
      "Effect": "Allow",
      "Action": [
        "s3:GetObject",
        "s3:ListBucket"
      ],
      "Resource": [
        "arn:aws:s3:::imageopt-transformed-329599656829-us-east-1",
        "arn:aws:s3:::imageopt-transformed-329599656829-us-east-1/*"
      ]
    }
  ]
}
```

### Step 3: Create Access Key

1. Go to user → Security credentials
2. Create access key
3. Choose "Application running on AWS compute service"
4. Download credentials

### Step 4: Update .env

```bash
AWS_ACCESS_KEY_ID=<from download>
AWS_SECRET_ACCESS_KEY=<from download>
```

---

## What Permissions Are Granted?

### Original Bucket (`imageopt-original-*`)
- ✅ `s3:PutObject` - Upload files via presigned URLs
- ✅ `s3:GetObject` - Read uploaded files
- ✅ `s3:DeleteObject` - Delete user assets
- ✅ `s3:ListBucket` - List user's files
- ✅ `s3:PutObjectAcl` - Required for presigned URLs

### Transformed Bucket (`imageopt-transformed-*`)
- ✅ `s3:GetObject` - Read cached transformed images
- ✅ `s3:ListBucket` - List cached variants

### NOT Granted (Least Privilege)
- ❌ Cannot delete transformed bucket
- ❌ Cannot modify bucket policies
- ❌ Cannot access other AWS services
- ❌ Cannot create/delete buckets

---

## Production: Use Secrets Manager

For production, store credentials securely:

### Deploy with Secrets Manager

```typescript
const backendIamStack = new BackendIamStack(app, 'ImageOpt-BackendIAM', {
  useSecretsManager: true, // ← Enable this
  // ...
});
```

### Retrieve Credentials

```powershell
aws secretsmanager get-secret-value `
  --secret-id imageopt/backend-api-credentials `
  --query SecretString `
  --output text | ConvertFrom-Json
```

### Update Backend to Use Secrets Manager

```typescript
// src/config/env.ts
import { SecretsManagerClient, GetSecretValueCommand } from '@aws-sdk/client-secrets-manager';

async function loadSecretsFromAWS() {
  const client = new SecretsManagerClient({ region: 'us-east-1' });
  const response = await client.send(
    new GetSecretValueCommand({ SecretId: 'imageopt/backend-api-credentials' })
  );
  return JSON.parse(response.SecretString!);
}
```

---

## Verify Everything Works

### 1. Run Permission Test
```powershell
cd backend
npx tsx test-s3-permissions.ts
```

### 2. Start Backend
```powershell
npm run dev
```

### 3. Test Upload Flow
```powershell
# Register user
curl -X POST http://localhost:5000/api/auth/register `
  -H "Content-Type: application/json" `
  -d '{"email":"test@example.com","password":"password123"}'

# Get upload URL
curl -X POST http://localhost:5000/api/assets/upload-url `
  -H "Authorization: Bearer YOUR_TOKEN" `
  -H "Content-Type: application/json" `
  -d '{"fileName":"test.jpg","fileType":"image/jpeg","fileSize":1048576}'
```

If you get a presigned URL ✅ - permissions are working!

---

## Troubleshooting

### Error: "Access Denied"
- Check bucket names match exactly
- Verify IAM policy is attached to user
- Confirm credentials in .env are correct

### Error: "Signature does not match"
- Credentials are incorrect
- Re-generate access key

### Error: "NoSuchBucket"
- Bucket name is wrong
- Check `S3_ORIGINAL_BUCKET` in .env

---

## Summary

✅ **Recommended Flow**:
1. Test current credentials first
2. If they work, keep using them for prototype
3. Before production, deploy `BackendIamStack`
4. Rotate to new least-privilege credentials
5. Move to Secrets Manager or EC2 instance roles

🔒 **Security Best Practices**:
- Never commit `.env` to git
- Use least-privilege IAM policies
- Rotate credentials regularly
- Use Secrets Manager in production
- Enable CloudTrail for audit logs
