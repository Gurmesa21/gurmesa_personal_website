import * as fs from 'fs';
import * as path from 'path';

// Generate dummy video
const dummyLargeVideoPath = path.join(process.cwd(), 'tests', 'e2e', 'test-large-video-g.mp4');
const largeBuffer = Buffer.alloc(6 * 1024 * 1024);
largeBuffer.write('00000018667479706D703432000000006D70343269736F6D0000000866726565000000086D646174', 0, 'hex');
fs.writeFileSync(dummyLargeVideoPath, largeBuffer);

const arr = new Uint8Array(largeBuffer);
const isMP4 = arr[4] === 0x66 && arr[5] === 0x74 && arr[6] === 0x79 && arr[7] === 0x70;
console.log('isMP4:', isMP4);
if (isMP4) console.log('Returns video/mp4');
else {
  const isJPEG = arr[0] === 0xFF && arr[1] === 0xD8 && arr[2] === 0xFF;
  const isPNG = arr[0] === 0x89 && arr[1] === 0x50 && arr[2] === 0x4E && arr[3] === 0x47;
  console.log('isJPEG:', isJPEG, 'isPNG:', isPNG);
}
