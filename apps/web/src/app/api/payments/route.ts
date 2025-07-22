import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createPaymentSchema } from '@/lib/validations';

// POST /api/payments - Create a payment record and link to booking
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate request body
    const validatedData = createPaymentSchema.parse(body);

    // Check if booking exists and doesn't already have a payment
    const booking = await prisma.booking.findUnique({
      where: { id: validatedData.bookingId },
      include: {
        payment: true,
        service: {
          select: {
            price: true,
          },
        },
      },
    });

    if (!booking) {
      return NextResponse.json(
        { error: 'Booking not found' },
        { status: 404 }
      );
    }

    if (booking.payment) {
      return NextResponse.json(
        { error: 'Payment already exists for this booking' },
        { status: 409 }
      );
    }

    // Verify payment amount matches service price
    if (validatedData.amount !== booking.service.price.toNumber()) {
      return NextResponse.json(
        { error: 'Payment amount does not match service price' },
        { status: 400 }
      );
    }

    // Create the payment record
    const payment = await prisma.payment.create({
      data: {
        bookingId: validatedData.bookingId,
        amount: validatedData.amount,
        currency: validatedData.currency,
        status: 'PENDING',
        provider: validatedData.provider,
        providerId: validatedData.providerId,
        paidAt: validatedData.provider === 'cash' ? new Date() : null,
      },
      include: {
        booking: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
            service: {
              select: {
                id: true,
                name: true,
                price: true,
              },
            },
            business: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    });

    // If it's a cash payment, mark it as paid immediately
    if (validatedData.provider === 'cash') {
      await prisma.payment.update({
        where: { id: payment.id },
        data: { 
          status: 'PAID',
          paidAt: new Date(),
        },
      });
    }

    return NextResponse.json(payment, { status: 201 });
  } catch (error) {
    console.error('Error creating payment:', error);

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
        { error: 'Payment already exists for this booking' },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// GET /api/payments - Get payment information (for operators/admins)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const bookingId = searchParams.get('bookingId');
    const businessId = searchParams.get('businessId');
    const status = searchParams.get('status');
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = parseInt(searchParams.get('offset') || '0');

    // Build where clause based on filters
    const where: any = {};
    
    if (bookingId) {
      where.bookingId = bookingId;
    }
    
    if (businessId) {
      where.booking = {
        businessId: businessId,
      };
    }
    
    if (status) {
      where.status = status;
    }

    const payments = await prisma.payment.findMany({
      where,
      include: {
        booking: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
            service: {
              select: {
                id: true,
                name: true,
                price: true,
              },
            },
            business: {
              select: {
                id: true,
                name: true,
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
    const total = await prisma.payment.count({ where });

    return NextResponse.json({
      payments,
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + limit < total,
      },
    });
  } catch (error) {
    console.error('Error fetching payments:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 