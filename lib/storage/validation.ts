export async function validateMediaUpload(file: File): Promise<void> {
  const MAX_SIZE = 5 * 1024 * 1024; // 5MB limit
  if (file.size > MAX_SIZE) {
    throw new Error(`File size exceeds the 5MB limit. (${file.size} bytes)`);
  }

  const buffer = await file.arrayBuffer();
  const arr = new Uint8Array(buffer);

  if (arr.length < 12) {
    throw new Error('File is too small or invalid');
  }

  const isJPEG = arr[0] === 0xFF && arr[1] === 0xD8 && arr[2] === 0xFF;
  const isPNG = arr[0] === 0x89 && arr[1] === 0x50 && arr[2] === 0x4E && arr[3] === 0x47;
  const isGIF = arr[0] === 0x47 && arr[1] === 0x49 && arr[2] === 0x46 && arr[3] === 0x38;
  const isPDF = arr[0] === 0x25 && arr[1] === 0x50 && arr[2] === 0x44 && arr[3] === 0x46;
  const isWEBP = arr[0] === 0x52 && arr[1] === 0x49 && arr[2] === 0x46 && arr[3] === 0x46 &&
                 arr[8] === 0x57 && arr[9] === 0x45 && arr[10] === 0x42 && arr[11] === 0x50;

  if (!isJPEG && !isPNG && !isGIF && !isPDF && !isWEBP) {
    throw new Error('Invalid file format. Only JPEG, PNG, GIF, WebP, and PDF are allowed.');
  }
}
