import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireUser } from '@/lib/middleware/auth';
import { JwtPayload } from '@/lib/jwt';

// GET /api/auth/me - Get current user information (protected route)
export const GET = requireUser(async (request: NextRequest, user: JwtPayload) => {
  try {
    // Fetch full user information from database
    const currentUser = await prisma.user.findUnique({
      where: { id: user.userId },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            ownedBusinesses: true,
            bookings: true,
            reviews: true,
          },
        },
      },
    });

    if (!currentUser) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      user: currentUser,
      tokenInfo: {
        userId: user.userId,
        email: user.email,
        role: user.role,
        issuedAt: user.iat ? new Date(user.iat * 1000) : null,
        expiresAt: user.exp ? new Date(user.exp * 1000) : null,
      },
    });
  } catch (error) {
    console.error('Error fetching user info:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}); 