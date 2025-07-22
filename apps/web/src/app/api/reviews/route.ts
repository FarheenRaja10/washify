import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createReviewSchema } from '@/lib/validations';

// GET /api/reviews - Fetch reviews with optional filtering
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const businessId = searchParams.get('businessId');
    const userId = searchParams.get('userId');
    const minRating = parseInt(searchParams.get('minRating') || '1');
    const maxRating = parseInt(searchParams.get('maxRating') || '5');
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = parseInt(searchParams.get('offset') || '0');

    // Build where clause based on filters
    const where: any = {
      rating: {
        gte: minRating,
        lte: maxRating,
      },
    };

    if (userId) {
      where.userId = userId;
    }

    if (businessId) {
      where.booking = {
        businessId: businessId,
      };
    }

    const reviews = await prisma.review.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            // Don't include email for privacy
          },
        },
        booking: {
          include: {
            service: {
              select: {
                id: true,
                name: true,
                tier: true,
              },
            },
            business: {
              select: {
                id: true,
                name: true,
                address: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: limit,
      skip: offset,
    });

    // Get total count for pagination
    const total = await prisma.review.count({ where });

    // Calculate average rating if businessId is provided
    let averageRating = null;
    if (businessId) {
      const ratingStats = await prisma.review.aggregate({
        where: {
          booking: {
            businessId: businessId,
          },
        },
        _avg: {
          rating: true,
        },
        _count: {
          rating: true,
        },
      });
      
      averageRating = {
        average: ratingStats._avg.rating ? parseFloat(ratingStats._avg.rating.toFixed(1)) : 0,
        count: ratingStats._count.rating,
      };
    }

    return NextResponse.json({
      reviews,
      averageRating,
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + limit < total,
      },
    });
  } catch (error) {
    console.error('Error fetching reviews:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/reviews - Create a new review
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate request body
    const validatedData = createReviewSchema.parse(body);

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id: validatedData.userId },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Check if booking exists and belongs to the user
    const booking = await prisma.booking.findFirst({
      where: {
        id: validatedData.bookingId,
        userId: validatedData.userId,
      },
      include: {
        review: true,
        payment: {
          select: {
            status: true,
          },
        },
      },
    });

    if (!booking) {
      return NextResponse.json(
        { error: 'Booking not found or does not belong to this user' },
        { status: 404 }
      );
    }

    // Check if booking is completed
    if (booking.status !== 'COMPLETED') {
      return NextResponse.json(
        { error: 'Can only review completed bookings' },
        { status: 400 }
      );
    }

    // Check if review already exists
    if (booking.review) {
      return NextResponse.json(
        { error: 'Review already exists for this booking' },
        { status: 409 }
      );
    }

    // Optional: Check if payment is completed (business logic)
    if (booking.payment && booking.payment.status !== 'PAID') {
      return NextResponse.json(
        { error: 'Cannot review unpaid bookings' },
        { status: 400 }
      );
    }

    // Create the review
    const review = await prisma.review.create({
      data: {
        userId: validatedData.userId,
        bookingId: validatedData.bookingId,
        rating: validatedData.rating,
        comment: validatedData.comment,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
          },
        },
        booking: {
          include: {
            service: {
              select: {
                id: true,
                name: true,
                tier: true,
              },
            },
            business: {
              select: {
                id: true,
                name: true,
                address: true,
              },
            },
          },
        },
      },
    });

    return NextResponse.json(review, { status: 201 });
  } catch (error) {
    console.error('Error creating review:', error);

    // Handle validation errors
    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Invalid input data', details: error.message },
        { status: 400 }
      );
    }

    // Handle Prisma errors
    if (error instanceof Error && error.message.includes('Unique constraint')) {
      return NextResponse.json(
        { error: 'Review already exists for this booking' },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 