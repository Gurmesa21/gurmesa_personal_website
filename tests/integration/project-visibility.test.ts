import { test, expect } from 'vitest';
import { prisma } from '../../server/repositories/db';

test('Project query can filter by confidentiality', async () => {
  const privateProjects = await prisma.project.findMany({
    where: { confidentiality: 'PRIVATE' }
  });
  
  const publicProjects = await prisma.project.findMany({
    where: { confidentiality: 'PUBLIC' }
  });

  expect(privateProjects.every(p => p.confidentiality === 'PRIVATE')).toBe(true);
  expect(publicProjects.every(p => p.confidentiality === 'PUBLIC')).toBe(true);
  
  expect(privateProjects.length).toBeGreaterThanOrEqual(1);
  expect(publicProjects.length).toBeGreaterThanOrEqual(1);
});
