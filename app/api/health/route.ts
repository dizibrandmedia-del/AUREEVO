import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const startTime = Date.now();
  let dbStatus = 'disconnected';
  let dbLatencyMs = 0;

  try {
    const dbStart = Date.now();
    await prisma.$queryRaw`SELECT 1`;
    dbLatencyMs = Date.now() - dbStart;
    dbStatus = 'healthy';
  } catch (err: any) {
    dbStatus = 'unhealthy';
  }

  const memory = process.memoryUsage();
  const uptime = process.uptime();
  const isHealthy = dbStatus === 'healthy';

  const healthData = {
    status: isHealthy ? 'healthy' : 'degraded',
    version: '1.0.0-production',
    service: 'AUREEVO Luxury Platform',
    timestamp: new Date().toISOString(),
    totalLatencyMs: Date.now() - startTime,
    checks: {
      database: {
        status: dbStatus,
        latencyMs: dbLatencyMs,
      },
      system: {
        uptimeSeconds: Math.floor(uptime),
        nodeEnv: process.env.NODE_ENV || 'production',
        memoryRssMb: Math.round(memory.rss / (1024 * 1024)),
        memoryHeapUsedMb: Math.round(memory.heapUsed / (1024 * 1024)),
      },
    },
  };

  return NextResponse.json(healthData, {
    status: 200,
    headers: {
      'Cache-Control': 'no-store, max-age=0',
      'Content-Type': 'application/json',
    },
  });
}
