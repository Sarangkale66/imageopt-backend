// test-s3-permissions.ts
// Quick test to verify S3 permissions for backend API

import { S3Client, PutObjectCommand, ListObjectsV2Command } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import dotenv from 'dotenv';

dotenv.config();

const s3 = new S3Client({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

async function testPermissions() {
  console.log('🧪 Testing S3 Permissions for Backend API\n');
  console.log('Configuration:');
  console.log(`  Region: ${process.env.AWS_REGION}`);
  console.log(`  Original Bucket: ${process.env.S3_ORIGINAL_BUCKET}`);
  console.log(`  Transformed Bucket: ${process.env.S3_TRANSFORMED_BUCKET}`);
  console.log(`  Access Key: ${process.env.AWS_ACCESS_KEY_ID?.substring(0, 8)}...`);
  console.log('');

  let passedTests = 0;
  let totalTests = 3;

  // Test 1: Generate presigned URL for original bucket upload
  try {
    const putCommand = new PutObjectCommand({
      Bucket: process.env.S3_ORIGINAL_BUCKET,
      Key: 'test/permission-test.txt',
      ContentType: 'text/plain',
    });
    const uploadUrl = await getSignedUrl(s3, putCommand, { expiresIn: 900 });
    console.log('✅ Test 1: Can generate presigned URL for original bucket upload');
    console.log(`   URL: ${uploadUrl.substring(0, 80)}...`);
    passedTests++;
  } catch (error: any) {
    console.log('❌ Test 1: FAILED - Cannot generate presigned URL');
    console.log(`   Error: ${error.message}`);
    console.log(`   Code: ${error.Code}`);
  }

  console.log('');

  // Test 2: List original bucket (verify read access)
  try {
    const listResponse = await s3.send(new ListObjectsV2Command({
      Bucket: process.env.S3_ORIGINAL_BUCKET,
      MaxKeys: 5,
    }));
    console.log('✅ Test 2: Can list original bucket');
    console.log(`   Files found: ${listResponse.KeyCount || 0}`);
    passedTests++;
  } catch (error: any) {
    console.log('❌ Test 2: FAILED - Cannot list original bucket');
    console.log(`   Error: ${error.message}`);
    console.log(`   Code: ${error.Code}`);
  }

  console.log('');

  // Test 3: List transformed bucket (verify read access)
  try {
    const listResponse = await s3.send(new ListObjectsV2Command({
      Bucket: process.env.S3_TRANSFORMED_BUCKET,
      MaxKeys: 5,
    }));
   console.log('✅ Test 3: Can list transformed bucket');
    console.log(`   Files found: ${listResponse.KeyCount || 0}`);
    passedTests++;
  } catch (error: any) {
    console.log('❌ Test 3: FAILED - Cannot list transformed bucket');
    console.log(`   Error: ${error.message}`);
    console.log(`   Code: ${error.Code}`);
  }

  console.log('');
  console.log('═══════════════════════════════════════');
  console.log(`Results: ${passedTests}/${totalTests} tests passed`);
  console.log('═══════════════════════════════════════');
  console.log('');

  if (passedTests === totalTests) {
    console.log('✅ All permissions are working correctly!');
    console.log('   Your backend can:');
    console.log('   - Generate presigned URLs for uploads');
    console.log('   - Read/list original bucket');
    console.log('   - Read/list transformed bucket');
    console.log('');
    console.log('👍 You can proceed with running the backend API.');
  } else {
    console.log('❌ Some permissions are missing!');
    console.log('');
    console.log('Solutions:');
    console.log('  1. Check if AWS credentials in .env are correct');
    console.log('  2. Verify credentials have S3 permissions');
    console.log('  3. Deploy the BackendIamStack for dedicated IAM user');
    console.log('');
    console.log('Run: npx cdk deploy ImageOpt-BackendIAM');
  }
}

testPermissions().catch(console.error);
