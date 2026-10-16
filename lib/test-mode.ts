export function isTestMode() {
  if (process.env.APP_ENV === 'production' && process.env.PLAYWRIGHT_TEST === '1') {
    throw new Error('PLAYWRIGHT_TEST=1 is not allowed in production');
  }
  return process.env.APP_ENV === 'test' && process.env.PLAYWRIGHT_TEST === '1';
}
