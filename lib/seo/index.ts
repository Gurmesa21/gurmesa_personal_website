export function getBaseUrl(): string {
  const envUrl =
    process.env.NEXT_PUBLIC_SITE_URL ||
    process.env.SITE_URL ||
    (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : undefined) ||
    process.env.RENDER_EXTERNAL_URL;

  if (envUrl && envUrl.trim().length > 0) {
    const formatted = envUrl.trim().replace(/\/+$/, '');
    return formatted.startsWith('http://') || formatted.startsWith('https://')
      ? formatted
      : `https://${formatted}`;
  }

  if (process.env.APP_ENV === 'production') {
    return 'https://gurmesa.tech';
  }

  const port = process.env.PORT || '3000';
  return `http://localhost:${port}`;
}

export function buildAlternates(
  pathname: string,
  locale: string = 'en',
  overrideCanonical?: string | null
) {
  const baseUrl = getBaseUrl();
  const cleanPath = (!pathname || pathname === '/') ? '' : pathname.startsWith('/') ? pathname : `/${pathname}`;

  let canonical = `${baseUrl}${cleanPath}`;
  if (locale === 'am') {
    canonical = `${baseUrl}/am${cleanPath}`;
  } else if (locale === 'om') {
    canonical = `${baseUrl}/om${cleanPath}`;
  }

  if (overrideCanonical && overrideCanonical.trim()) {
    canonical = overrideCanonical.trim();
  }

  return {
    canonical,
    languages: {
      en: `${baseUrl}${cleanPath}`,
      am: `${baseUrl}/am${cleanPath}`,
      om: `${baseUrl}/om${cleanPath}`,
      'x-default': `${baseUrl}${cleanPath}`,
    },
  };
}

export function getVerificationMetadata(): {
  verification?: { google?: string };
  other?: Record<string, string>;
} {
  const google =
    process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION ||
    process.env.GOOGLE_SITE_VERIFICATION;
  const bing =
    process.env.NEXT_PUBLIC_BING_SITE_VERIFICATION ||
    process.env.BING_SITE_VERIFICATION;

  const res: { verification?: { google?: string }; other?: Record<string, string> } = {};

  if (google && google.trim()) {
    res.verification = { google: google.trim() };
  }
  if (bing && bing.trim()) {
    res.other = { 'msvalidate.01': bing.trim() };
  }

  return res;
}
