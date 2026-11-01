/**
 * Fix Media Cache Headers Script
 * 
 * Re-applies Cache-Control: 'public, max-age=31536000, immutable'
 * to existing S3 media objects via CopyObjectCommand.
 */

import { S3Client, CopyObjectCommand, HeadObjectCommand } from '@aws-sdk/client-s3';
import { prisma } from '../server/repositories/db';

async function main() {
  const bucket = process.env.STORAGE_BUCKET || 'avenor-media';
  const endpoint = process.env.STORAGE_ENDPOINT;
  const region = process.env.STORAGE_REGION || 'us-east-2';
  const accessKeyId = process.env.STORAGE_ACCESS_KEY || '';
  const secretAccessKey = process.env.STORAGE_SECRET_KEY || '';

  if (!accessKeyId || !secretAccessKey) {
    console.warn('[Fix Cache Headers] Missing storage credentials, skipping execution.');
    return;
  }

  const client = new S3Client({
    region,
    endpoint: endpoint || undefined,
    credentials: {
      accessKeyId,
      secretAccessKey,
    },
    forcePathStyle: true,
  });

  const assets = await prisma.mediaAsset.findMany();
  console.log(`[Fix Cache Headers] Found ${assets.length} media assets to inspect...`);

  let updatedCount = 0;
  for (const asset of assets) {
    try {
      const head = await client.send(
        new HeadObjectCommand({
          Bucket: bucket,
          Key: asset.storageKey,
        })
      );

      const currentCacheControl = head.CacheControl;
      if (currentCacheControl !== 'public, max-age=31536000, immutable') {
        await client.send(
          new CopyObjectCommand({
            Bucket: bucket,
            CopySource: `${bucket}/${asset.storageKey}`,
            Key: asset.storageKey,
            MetadataDirective: 'REPLACE',
            ContentType: asset.mimeType,
            CacheControl: 'public, max-age=31536000, immutable',
          })
        );
        updatedCount++;
        console.log(`Updated cache control for: ${asset.storageKey}`);
      }
    } catch (err: any) {
      console.warn(`Failed to update ${asset.storageKey}:`, err.message);
    }
  }

  console.log(`[Fix Cache Headers] Finished. Updated ${updatedCount} of ${assets.length} objects.`);
}

if (process.env.APP_ENV !== 'production' && require.main === module) {
  main()
    .catch((e) => {
      console.error(e);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}

export { main as fixMediaCacheHeaders };

