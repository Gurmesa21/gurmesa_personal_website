import { NextResponse } from 'next/server';
import { prisma } from '../../../server/repositories/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // 2s timeout for the health check query
    const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), 2000));
    const dbPromise = prisma.$queryRaw`SELECT 1`;
    
    await Promise.race([dbPromise, timeoutPromise]);

    return NextResponse.json(
      { status: 'ok' },
      { 
        status: 200, 
        headers: { 'Cache-Control': 'no-store' } 
      }
    );
  } catch (error) {
    // Never leak error details
    return NextResponse.json(
      { status: 'degraded' },
      { 
        status: 503, 
        headers: { 'Cache-Control': 'no-store' } 
      }
    );
  }
}
