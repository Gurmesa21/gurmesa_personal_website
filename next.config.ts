import type { NextConfig } from "next";
import path from "path";

if (process.env.APP_ENV === 'production' && process.env.PLAYWRIGHT_TEST === '1') {
  throw new Error('PLAYWRIGHT_TEST=1 is not allowed in production');
}

const storageEndpoint = process.env.STORAGE_ENDPOINT || process.env.STORAGE_PUBLIC_URL || '';
let storageHost = '';
try {
  if (storageEndpoint) {
    storageHost = new URL(storageEndpoint).hostname;
  }
} catch {
  // ignore
}
const storageOrigin = storageHost ? `https://${storageHost}` : '';

const nextConfig: NextConfig = {
  outputFileTracingRoot: path.resolve(__dirname),
  experimental: {
    serverActions: {
      bodySizeLimit: '30mb',
    },
    proxyClientMaxBodySize: 30 * 1024 * 1024,
  },
  images: {
    remotePatterns: [
      ...(storageHost ? [{ protocol: "https" as const, hostname: storageHost }] : []),
      {
        protocol: "https",
        hostname: "*.neon.tech",
      },
      {
        protocol: "https",
        hostname: "**",
      },
    ],
  },
  async headers() {
    const isProd = process.env.NODE_ENV === 'production';
    const cspDirectives = [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
      "style-src 'self' 'unsafe-inline'",
      `img-src 'self' data: blob: https: ${storageOrigin}`.trim(),
      `media-src 'self' data: blob: https: ${storageOrigin}`.trim(),
      "font-src 'self' data:",
      `connect-src 'self' https: ${storageOrigin}`.trim(),
      "object-src 'none'",
      "base-uri 'self'",
      "frame-ancestors 'none'",
      "form-action 'self'",
    ];

    const securityHeaders = [
      { key: 'X-Content-Type-Options', value: 'nosniff' },
      { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
      { key: 'X-Frame-Options', value: 'DENY' },
      { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
      { key: 'Content-Security-Policy', value: cspDirectives.join('; ') + ';' },
    ];

    if (isProd) {
      securityHeaders.push({
        key: 'Strict-Transport-Security',
        value: 'max-age=63072000; includeSubDomains; preload'
      });
    }

    return [
      {
        source: '/(.*)',
        headers: securityHeaders,
      }
    ];
  },
};

import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./i18n.ts');

export default withNextIntl(nextConfig);
