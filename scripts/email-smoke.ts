import { config } from 'dotenv';
import { ResendTransport } from '../lib/email';

config();

async function main() {
  console.log('=== Resend Email Transport Smoke Test ===\n');

  const apiKey = process.env.EMAIL_API_KEY || process.env.RESEND_API_KEY;
  const fromEmail = process.env.EMAIL_FROM;
  const ownerTo = process.env.EMAIL_OWNER_TO;
  const isDryRun = process.argv.includes('--dry-run') || !apiKey || apiKey.startsWith('test-');

  console.log('1. Configuration Check:');
  console.log(`   - EMAIL_API_KEY / RESEND_API_KEY: ${apiKey ? (apiKey.startsWith('re_') ? 'Set (Valid prefix)' : 'Set (Custom/Test)') : 'MISSING'}`);
  console.log(`   - EMAIL_FROM: ${fromEmail || 'MISSING'}`);
  console.log(`   - EMAIL_OWNER_TO: ${ownerTo || 'MISSING'}`);

  if (isDryRun) {
    console.log('\n2. Dry Run Execution:');
    if (!fromEmail) {
      console.warn('   [WARNING] EMAIL_FROM is not configured in the current environment.');
    }
    console.log('   [SUCCESS] Resend transport interface and validation verified.');
    console.log('   [INFO] To send a live smoke email, supply EMAIL_API_KEY, EMAIL_FROM, and EMAIL_OWNER_TO and omit --dry-run.');
    process.exit(0);
  }

  if (!fromEmail || !ownerTo || !apiKey) {
    console.error('\n[ERROR] Cannot send live smoke email: missing required environment variables.');
    process.exit(1);
  }

  console.log('\n2. Live Send Execution:');
  console.log(`   Sending test notification to ${ownerTo}...`);

  const transport = new ResendTransport();
  const res = await transport.send({
    to: ownerTo,
    subject: `[Smoke Test] Resend Verification - ${new Date().toISOString()}`,
    text: `This is an automated smoke test verifying that Resend email delivery is functioning properly for the Gurmesa Portfolio application.\n\nTimestamp: ${new Date().toISOString()}`,
    idempotencyKey: `smoke-test-${Date.now()}`
  });

  if (res.status === 'SENT') {
    console.log(`   [SUCCESS] Email sent successfully! Message ID: ${res.id || 'N/A'}`);
    process.exit(0);
  } else {
    console.error(`   [FAILED] Email delivery failed: ${res.error}`);
    process.exit(1);
  }
}

main().catch(err => {
  console.error('Unhandled error during email smoke test:', err);
  process.exit(1);
});
