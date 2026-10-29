import { S3Client, ListObjectsV2Command, GetObjectCommand, ListObjectsV2CommandOutput, GetObjectCommandOutput } from '@aws-sdk/client-s3';
import { config } from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';
import { Readable } from 'stream';
import { pipeline } from 'stream/promises';

config();

async function backupMedia() {
  const startTime = Date.now();
  console.log('=== Neon Object Storage Media Backup ===');

  const endpoint = process.env.STORAGE_ENDPOINT || process.env.S3_ENDPOINT;
  const region = process.env.STORAGE_REGION || process.env.S3_REGION || 'us-east-2';
  const bucket = process.env.STORAGE_BUCKET || process.env.S3_BUCKET || 'avenor-media';
  const accessKeyId = process.env.STORAGE_ACCESS_KEY || process.env.S3_ACCESS_KEY;
  const secretAccessKey = process.env.STORAGE_SECRET_KEY || process.env.S3_SECRET_KEY;

  if (!endpoint || !accessKeyId || !secretAccessKey || !bucket) {
    console.error('ERROR: Missing storage environment variables (STORAGE_ENDPOINT, STORAGE_ACCESS_KEY, STORAGE_SECRET_KEY, STORAGE_BUCKET).');
    process.exit(1);
  }

  const outputDir = process.env.MEDIA_BACKUP_DIR || path.join(process.cwd(), 'backups', 'media', new Date().toISOString().replace(/[:.]/g, '-'));
  fs.mkdirSync(outputDir, { recursive: true });

  console.log(`Connecting to: ${endpoint}`);
  console.log(`Bucket: ${bucket}`);
  console.log(`Target directory: ${outputDir}`);

  const client = new S3Client({
    region,
    endpoint,
    credentials: {
      accessKeyId,
      secretAccessKey,
    },
    forcePathStyle: true,
  });

  let totalObjects = 0;
  let totalBytes = 0;
  let continuationToken: string | undefined = undefined;

  try {
    do {
      const listCmd = new ListObjectsV2Command({
        Bucket: bucket,
        ContinuationToken: continuationToken,
      });

      const listRes: ListObjectsV2CommandOutput = await client.send(listCmd);
      const contents = listRes.Contents || [];

      for (const item of contents) {
        if (!item.Key) continue;
        const key = item.Key;
        const size = item.Size || 0;
        const targetPath = path.join(outputDir, key);

        fs.mkdirSync(path.dirname(targetPath), { recursive: true });

        const getCmd = new GetObjectCommand({
          Bucket: bucket,
          Key: key,
        });

        const getRes: GetObjectCommandOutput = await client.send(getCmd);
        if (getRes.Body instanceof Readable) {
          await pipeline(getRes.Body, fs.createWriteStream(targetPath));
        } else if (getRes.Body) {
          const bytes = await (getRes.Body as any).transformToByteArray();
          fs.writeFileSync(targetPath, Buffer.from(bytes));
        }

        totalObjects++;
        totalBytes += size;
        console.log(`  Downloaded: ${key} (${(size / 1024).toFixed(1)} KB)`);
      }

      continuationToken = listRes.NextContinuationToken;
    } while (continuationToken);

    const durationSec = ((Date.now() - startTime) / 1000).toFixed(2);
    console.log('\n=======================================');
    console.log(`Backup completed successfully in ${durationSec}s`);
    console.log(`Total Objects: ${totalObjects}`);
    console.log(`Total Downloaded Size: ${(totalBytes / (1024 * 1024)).toFixed(2)} MB`);
    console.log(`Saved To: ${outputDir}`);
    console.log('=======================================');
    process.exit(0);
  } catch (err: any) {
    console.error('Backup failed:', err.message || err);
    process.exit(1);
  }
}

backupMedia();
