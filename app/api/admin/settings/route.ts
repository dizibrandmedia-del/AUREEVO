import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdminAuth, successResponse, errorResponse } from '@/lib/api-response';
import { logActivity } from '@/lib/activity-logger';

export async function GET() {
  const auth = await requireAdminAuth('settings.view');
  if (!auth.authorized) return auth.response;

  try {
    const settings = await prisma.adminSetting.findMany();
    const grouped: Record<string, Record<string, string>> = {
      BUSINESS: {},
      BRANDING: {},
      GENERAL: {},
      INTEGRATIONS: {},
    };

    for (const s of settings) {
      if (!grouped[s.group]) grouped[s.group] = {};
      grouped[s.group][s.key] = s.value;
    }

    return successResponse({ settings: grouped, raw: settings });
  } catch (error: any) {
    console.error('Fetch settings error:', error);
    return errorResponse('Failed to fetch settings', 500);
  }
}

export async function PUT(req: NextRequest) {
  const auth = await requireAdminAuth('settings.manage');
  if (!auth.authorized) return auth.response;

  try {
    const body = await req.json();
    const { settings } = body; // Record of key -> value

    if (!settings || typeof settings !== 'object') {
      return errorResponse('Invalid settings payload', 400);
    }

    for (const [key, value] of Object.entries(settings)) {
      if (typeof value === 'string' || typeof value === 'number') {
        await prisma.adminSetting.updateMany({
          where: { key },
          data: { value: String(value) },
        });
      }
    }

    await logActivity({
      adminUserId: auth.admin?.id,
      action: 'UPDATE_SETTINGS',
      entity: 'AdminSetting',
      metadata: { updatedKeys: Object.keys(settings) },
    });

    return successResponse({ message: 'Settings updated successfully' });
  } catch (error: any) {
    console.error('Update settings error:', error);
    return errorResponse('Failed to update settings', 500);
  }
}
