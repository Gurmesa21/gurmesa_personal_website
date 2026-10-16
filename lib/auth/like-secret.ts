export function assertLikeHashSecret() {
  if (process.env.APP_ENV === 'production' && !process.env.LIKE_HASH_SECRET) {
    throw new Error('LIKE_HASH_SECRET is missing in production');
  }
}
