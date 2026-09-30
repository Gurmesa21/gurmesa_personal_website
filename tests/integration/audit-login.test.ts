import { describe, it, expect, vi } from 'vitest';
import { PrismaClient } from '@prisma/client';
import { authOptions } from '../../auth';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

vi.mock('next-auth', () => ({
  default: vi.fn(() => ({ auth: vi.fn(), signIn: vi.fn(), handlers: {} }))
}));
vi.mock('next-auth/providers/credentials', () => ({
  default: vi.fn((opts) => opts)
}));

describe('Audit Logs (Login)', () => {
  it('9c. Audit log entry is created for a login event', async () => {
    const authorize = (authOptions.providers[0] as any).authorize;

    // We need a real user to login
    const hash = await bcrypt.hash('password123', 10);
    const user = await prisma.adminUser.create({
      data: { name: 'Login Test', email: `login-${Date.now()}@test.com`, passwordHash: hash, status: 'ACTIVE' }
    });

    await authorize({ email: user.email, password: 'password123' }, {} as any);

    const logs = await prisma.auditLog.findMany({
      where: { entity: 'AdminUser', entityId: user.id, action: 'LOGIN' }
    });

    expect(logs.length).toBeGreaterThan(0);
    expect(logs[0].actorId).toBe(user.id);

    // cleanup
    await prisma.auditLog.deleteMany({ where: { actorId: user.id } });
    await prisma.adminUser.delete({ where: { id: user.id } });
  });
});
