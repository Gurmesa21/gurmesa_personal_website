const fs = require('fs');
const path = 'C:/Users/Hp/.gemini/antigravity-ide/brain/dfad06a4-c33b-4a03-9aca-0d0f2206831c/.system_generated/logs/transcript_full.jsonl';
const lines = fs.readFileSync(path, 'utf8').split('\n');
const firstUserInput = lines.find(l => l.includes('"type":"USER_INPUT"'));
if (firstUserInput) {
    console.log(JSON.parse(firstUserInput).content);
}
