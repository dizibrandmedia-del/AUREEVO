import { prisma } from '@/lib/prisma';
import { successResponse, errorResponse } from '@/lib/api-response';

export async function GET() {
  try {
    const categories = await prisma.category.findMany({
      where: {
        status: 'ACTIVE',
        parentId: null,
      },
      include: {
        children: {
          where: { status: 'ACTIVE' },
          include: {
            children: {
              where: { status: 'ACTIVE' },
            },
          },
          orderBy: { sortOrder: 'asc' },
        },
      },
      orderBy: { sortOrder: 'asc' },
    });

    return successResponse({ categories });
  } catch (err: any) {
    return errorResponse('Failed to fetch categories hierarchy', 500, err.message);
  }
}
