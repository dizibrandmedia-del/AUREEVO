import { getCustomerSession } from '@/lib/auth';
import { successResponse, errorResponse } from '@/lib/api-response';

export async function GET() {
  const session = await getCustomerSession();
  if (!session || !session.user) {
    return errorResponse('Not authenticated', 401);
  }
  return successResponse({ user: session.user });
}
