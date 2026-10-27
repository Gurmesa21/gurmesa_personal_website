export function validateLiveUrl(url: string | null | undefined): string | null {
  if (!url) return null;
  const trimmed = url.trim();
  if (!trimmed) return null;
  if (trimmed.length > 2048) {
    throw new Error('Live Project URL must not exceed 2048 characters');
  }
  try {
    const parsed = new URL(trimmed);
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
      throw new Error('Live URL must begin with http:// or https://');
    }
    return trimmed;
  } catch (err: any) {
    if (err?.message?.includes('Live URL must begin') || err?.message?.includes('2048')) {
      throw err;
    }
    throw new Error('Invalid URL format for Live Project URL');
  }
}
