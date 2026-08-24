import { getAdminSession } from '@/lib/auth';
import { successResponse, errorResponse } from '@/lib/api-response';

export async function GET() {
  const session = await getAdminSession();
  if (!session || !session.admin) {
    return errorResponse('Not authenticated', 401);
  }
  return successResponse({ admin: session.admin });
}
