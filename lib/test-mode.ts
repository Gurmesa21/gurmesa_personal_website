export function isTestMode() {
  const rawEnv = process.env.APP_ENV || '';
  const appEnv = rawEnv.replace(/^["']|["']$/g, '').trim();
  const rawPw = process.env.PLAYWRIGHT_TEST || '';
  const isPw = rawPw.replace(/^["']|["']$/g, '').trim() === '1';

  if (appEnv === 'production' && isPw) {
    throw new Error('PLAYWRIGHT_TEST=1 is not allowed in production');
  }
  if (appEnv === 'production') {
    return false;
  }
  return isPw || appEnv === 'test' || process.env.NODE_ENV === 'test';
}
