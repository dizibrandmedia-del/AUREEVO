import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCustomerSession } from '@/lib/auth';
import { successResponse, errorResponse } from '@/lib/api-response';

const PINCODE_REGEX = /^[1-9][0-9]{5}$/;

export async function GET() {
  try {
    const session = await getCustomerSession();
    if (!session || !session.user) {
      return errorResponse('Authentication required', 401);
    }

    const addresses = await prisma.address.findMany({
      where: { userId: session.user.id },
      orderBy: [{ isDefault: 'desc' }, { createdAt: 'desc' }],
    });

    return successResponse({ addresses });
  } catch (err: any) {
    return errorResponse('Failed to load saved addresses', 500, err.message);
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getCustomerSession();
    if (!session || !session.user) {
      return errorResponse('Authentication required', 401);
    }

    const body = await req.json();
    const { name, phone, addressLine1, addressLine2, city, state, pincode, landmark, addressType = 'HOME', isDefault = false } = body;

    if (!name || !phone || !addressLine1 || !city || !state || !pincode) {
      return errorResponse('Please complete all required address fields', 400);
    }

    if (!PINCODE_REGEX.test(pincode.trim())) {
      return errorResponse('Please provide a valid 6-digit Indian delivery pincode', 400);
    }

    // If set as default, unset previous default
    if (isDefault) {
      await prisma.address.updateMany({
        where: { userId: session.user.id, isDefault: true },
        data: { isDefault: false },
      });
    }

    const count = await prisma.address.count({ where: { userId: session.user.id } });

    const address = await prisma.address.create({
      data: {
        userId: session.user.id,
        name: name.trim(),
        phone: phone.trim(),
        addressLine1: addressLine1.trim(),
        addressLine2: addressLine2 ? addressLine2.trim() : null,
        city: city.trim(),
        state: state.trim(),
        pincode: pincode.trim(),
        landmark: landmark ? landmark.trim() : null,
        addressType,
        isDefault: isDefault || count === 0,
      },
    });

    return successResponse({ message: 'Address saved', address }, 201);
  } catch (err: any) {
    return errorResponse('Failed to save address', 500, err.message);
  }
}

export async function PUT(req: NextRequest) {
  try {
    const session = await getCustomerSession();
    if (!session || !session.user) {
      return errorResponse('Authentication required', 401);
    }

    const body = await req.json();
    const { id, name, phone, addressLine1, addressLine2, city, state, pincode, landmark, addressType, isDefault } = body;

    if (!id) return errorResponse('Address ID required', 400);

    if (pincode && !PINCODE_REGEX.test(pincode.trim())) {
      return errorResponse('Please provide a valid 6-digit Indian delivery pincode', 400);
    }

    if (isDefault) {
      await prisma.address.updateMany({
        where: { userId: session.user.id, isDefault: true },
        data: { isDefault: false },
      });
    }

    const updated = await prisma.address.update({
      where: { id, userId: session.user.id },
      data: {
        name: name?.trim(),
        phone: phone?.trim(),
        addressLine1: addressLine1?.trim(),
        addressLine2: addressLine2 !== undefined ? (addressLine2 ? addressLine2.trim() : null) : undefined,
        city: city?.trim(),
        state: state?.trim(),
        pincode: pincode?.trim(),
        landmark: landmark !== undefined ? (landmark ? landmark.trim() : null) : undefined,
        addressType,
        isDefault: isDefault !== undefined ? isDefault : undefined,
      },
    });

    return successResponse({ message: 'Address updated', address: updated });
  } catch (err: any) {
    return errorResponse('Failed to update address', 500, err.message);
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const session = await getCustomerSession();
    if (!session || !session.user) {
      return errorResponse('Authentication required', 401);
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) return errorResponse('Address ID required', 400);

    await prisma.address.delete({
      where: { id, userId: session.user.id },
    });

    return successResponse({ message: 'Address deleted' });
  } catch (err: any) {
    return errorResponse('Failed to delete address', 500, err.message);
  }
}
