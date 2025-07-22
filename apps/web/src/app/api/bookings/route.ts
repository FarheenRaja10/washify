import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createBookingSchema } from '@/lib/validations';
import { BookingStatus } from '@washify/db';

// GET /api/bookings - Fetch bookings with optional filtering
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const businessId = searchParams.get('businessId');
    const status = searchParams.get('status') as BookingStatus | null;
    const limit = parseInt(searchParams.get('limit') || '10');
    const offset = parseInt(searchParams.get('offset') || '0');

    // Build where clause based on filters
    const where: any = {};
    if (userId) where.userId = userId;
    if (businessId) where.businessId = businessId;
    if (status) where.status = status;

    const bookings = await prisma.booking.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
        business: {
          select: {
            id: true,
            name: true,
            address: true,
            lat: true,
            lng: true,
          },
        },
        service: {
          select: {
            id: true,
            name: true,
            description: true,
            price: true,
            duration: true,
            tier: true,
          },
        },
        payment: {
          select: {
            id: true,
            amount: true,
            currency: true,
            status: true,
            provider: true,
            paidAt: true,
          },
        },
        review: {
          select: {
            id: true,
            rating: true,
            comment: true,
            createdAt: true,
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
    const total = await prisma.booking.count({ where });

    return NextResponse.json({
      bookings,
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + limit < total,
      },
    });
  } catch (error) {
    console.error('Error fetching bookings:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/bookings - Create a new booking
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate request body
    const validatedData = createBookingSchema.parse(body);

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

    // Check if business exists
    const business = await prisma.business.findUnique({
      where: { id: validatedData.businessId },
    });
    if (!business) {
      return NextResponse.json(
        { error: 'Business not found' },
        { status: 404 }
      );
    }

    // Check if service exists and belongs to the business
    const service = await prisma.service.findFirst({
      where: {
        id: validatedData.serviceId,
        businessId: validatedData.businessId,
      },
    });
    if (!service) {
      return NextResponse.json(
        { error: 'Service not found or does not belong to this business' },
        { status: 404 }
      );
    }

    // Check for scheduling conflicts (optional business logic)
    const scheduledAt = new Date(validatedData.scheduledAt);
    const existingBooking = await prisma.booking.findFirst({
      where: {
        businessId: validatedData.businessId,
        scheduledAt: scheduledAt,
        status: {
          in: ['PENDING', 'IN_PROGRESS'],
        },
      },
    });

    if (existingBooking) {
      return NextResponse.json(
        { error: 'Time slot is already booked' },
        { status: 409 }
      );
    }

    // Create the booking
    const booking = await prisma.booking.create({
      data: {
        userId: validatedData.userId,
        businessId: validatedData.businessId,
        serviceId: validatedData.serviceId,
        scheduledAt: scheduledAt,
        status: 'PENDING',
        notes: validatedData.notes,
        photos: validatedData.photos || [],
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
        business: {
          select: {
            id: true,
            name: true,
            address: true,
            lat: true,
            lng: true,
          },
        },
        service: {
          select: {
            id: true,
            name: true,
            description: true,
            price: true,
            duration: true,
            tier: true,
          },
        },
      },
    });

    return NextResponse.json(booking, { status: 201 });
  } catch (error) {
    console.error('Error creating booking:', error);

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
        { error: 'Booking conflict detected' },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 