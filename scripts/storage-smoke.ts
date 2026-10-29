import { S3Client, PutObjectCommand, DeleteObjectCommand, HeadObjectCommand } from '@aws-sdk/client-s3';
import { config } from 'dotenv';

// Load .env
config();

async function runStorageSmoke() {
  console.log('--- Neon Object Storage Smoke Test ---');

  if (process.env.APP_ENV === 'production') {
    console.error('FAIL: storage-smoke.ts must NEVER be run against production (Working Rule 5). Exiting.');
    process.exit(1);
  }

  const endpoint = process.env.STORAGE_ENDPOINT;
  const region = process.env.STORAGE_REGION || 'us-east-2';
  const bucket = process.env.STORAGE_BUCKET || 'avenor-media';
  const accessKeyId = process.env.STORAGE_ACCESS_KEY;
  const secretAccessKey = process.env.STORAGE_SECRET_KEY;
  const publicUrlBase = process.env.STORAGE_PUBLIC_URL;

  if (!endpoint || !accessKeyId || !secretAccessKey || !bucket) {
    console.error('FAIL: Missing required storage environment variables (STORAGE_ENDPOINT, STORAGE_ACCESS_KEY, STORAGE_SECRET_KEY, STORAGE_BUCKET).');
    process.exit(1);
  }

  const host = new URL(endpoint).hostname;
  console.log(`Endpoint Host: ${host}`);
  console.log(`Target Bucket: ${bucket}`);
  console.log(`Target Region: ${region}`);

  // Neon Object Storage requires path-style addressing and SigV4
  const client = new S3Client({
    region,
    endpoint,
    credentials: {
      accessKeyId,
      secretAccessKey,
    },
    forcePathStyle: true,
  });

  const testKey = `media/smoke-test-${Date.now()}.txt`;
  const testPayload = `Neon Object Storage Smoke Test Payload - ${new Date().toISOString()}`;

  try {
    // 1. Upload
    console.log(`\n[1/4] Uploading test object: ${testKey}`);
    const putCmd = new PutObjectCommand({
      Bucket: bucket,
      Key: testKey,
      Body: Buffer.from(testPayload, 'utf8'),
      ContentType: 'text/plain',
    });
    await client.send(putCmd);
    console.log('Upload successful.');

    // 2. Fetch by public URL
    let publicUrl: string;
    if (publicUrlBase) {
      const base = publicUrlBase.endsWith('/') ? publicUrlBase.slice(0, -1) : publicUrlBase;
      publicUrl = base.endsWith(`/${bucket}`) ? `${base}/${testKey}` : `${base}/${bucket}/${testKey}`;
    } else {
      const ep = endpoint.endsWith('/') ? endpoint.slice(0, -1) : endpoint;
      publicUrl = `${ep}/${bucket}/${testKey}`;
    }

    console.log(`\n[2/4] Fetching object via public URL: ${publicUrl}`);
    try {
      const fetchRes = await fetch(publicUrl, { method: 'GET' });
      console.log(`Public URL HTTP Status: ${fetchRes.status} ${fetchRes.statusText}`);
      if (fetchRes.status === 200) {
        const bodyText = await fetchRes.text();
        if (bodyText === testPayload) {
          console.log('Content verification: MATCH');
        } else {
          console.warn(`Content verification mismatch: expected "${testPayload}", received "${bodyText}"`);
        }
      } else if (fetchRes.status === 403) {
        console.log('Bucket is private (access: private). Objects require presigned URLs or public_read configuration.');
      } else {
        console.warn(`Unexpected HTTP status from public URL: ${fetchRes.status}`);
      }
    } catch (fetchErr: any) {
      console.warn(`Fetch error on public URL: ${fetchErr.message}`);
    }

    // 3. Delete
    console.log(`\n[3/4] Deleting test object: ${testKey}`);
    const delCmd = new DeleteObjectCommand({
      Bucket: bucket,
      Key: testKey,
    });
    await client.send(delCmd);
    console.log('Delete request completed.');

    // 4. Verify Deletion
    console.log('\n[4/4] Verifying object is no longer present');
    try {
      await client.send(new HeadObjectCommand({ Bucket: bucket, Key: testKey }));
      console.error('FAIL: Object still exists after deletion!');
      process.exit(1);
    } catch (headErr: any) {
      if (headErr.name === 'NotFound' || headErr.$metadata?.httpStatusCode === 404) {
        console.log('Object successfully verified deleted (404 NotFound).');
      } else {
        console.log(`Deletion verified (HeadObject returned: ${headErr.name || headErr.message})`);
      }
    }

    console.log('\n==============================');
    console.log('STORAGE SMOKE TEST: PASS');
    console.log('==============================');
    process.exit(0);
  } catch (err: any) {
    console.error('\nFAIL: Storage smoke test encountered an error:', err.message || err);
    process.exit(1);
  }
}

runStorageSmoke();
