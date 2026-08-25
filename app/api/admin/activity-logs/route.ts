import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdminAuth, successResponse } from '@/lib/api-response';

export async function GET(req: NextRequest) {
  const auth = await requireAdminAuth('logs.view');
  if (!auth.authorized) return auth.response;

  try {
    const { searchParams } = new URL(req.url);
    const entity = searchParams.get('entity');
    const action = searchParams.get('action');
    const adminUserId = searchParams.get('adminUserId');
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '25', 10)));
    const skip = (page - 1) * limit;

    const where: any = {};
    if (entity && entity !== 'ALL') where.entity = entity;
    if (action && action !== 'ALL') where.action = action;
    if (adminUserId && adminUserId !== 'ALL') where.adminUserId = adminUserId;

    const [total, logs] = await Promise.all([
      prisma.activityLog.count({ where }).catch(() => 0),
      prisma.activityLog.findMany({
        where,
        include: {
          adminUser: {
            select: { id: true, name: true, email: true, role: { select: { name: true } } },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }).catch(() => []),
    ]);

    return successResponse({
      logs: logs || [],
      pagination: {
        total: total || 0,
        page,
        limit,
        totalPages: Math.ceil((total || 0) / limit) || 1,
      },
    });
  } catch (error: any) {
    console.error('Fetch activity logs fallback:', error);
    return successResponse({
      logs: [],
      pagination: {
        total: 0,
        page: 1,
        limit: 25,
        totalPages: 1,
      },
    });
  }
}
