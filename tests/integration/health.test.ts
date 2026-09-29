import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GET } from '../../app/api/health/route';
import { prisma } from '../../server/repositories/db';

vi.mock('../../server/repositories/db', () => ({
  prisma: {
    $queryRaw: vi.fn(),
  }
}));

describe('Day 10 - /api/health', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('/api/health returns 200 and {status:"ok"} with the DB reachable', async () => {
    (prisma.$queryRaw as any).mockResolvedValue([{ '?column?': 1 }]);
    const response = await GET();
    const data = await response.json();
    expect(response.status).toBe(200);
    expect(data).toEqual({ status: 'ok' });
    expect(response.headers.get('Cache-Control')).toBe('no-store');
  });

  it('/api/health returns 503 and {status:"degraded"} when the DB call is fault-injected to fail; response body contains no internal detail', async () => {
    (prisma.$queryRaw as any).mockRejectedValue(new Error('Connection refused at postgres://secret:password@10.0.0.1'));
    const response = await GET();
    const data = await response.json();
    expect(response.status).toBe(503);
    expect(data).toEqual({ status: 'degraded' });
    expect(JSON.stringify(data)).not.toContain('Connection refused');
    expect(JSON.stringify(data)).not.toContain('secret');
  });
});
