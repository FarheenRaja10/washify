import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createServiceSchema } from '@/lib/validations';
import { ServiceTier } from '@washify/db';
import { requireOperator, optionalAuth } from '@/lib/middleware/auth';
import { JwtPayload } from '@/lib/jwt';

// GET /api/services - Fetch services with optional filtering (no auth required)
export const GET = optionalAuth(async (request: NextRequest, user: JwtPayload | null) => {
  try {
    const { searchParams } = new URL(request.url);
    const businessId = searchParams.get('businessId');
    const tier = searchParams.get('tier') as ServiceTier | null;
    const minPrice = parseFloat(searchParams.get('minPrice') || '0');
    const maxPrice = parseFloat(searchParams.get('maxPrice') || '999999');
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = parseInt(searchParams.get('offset') || '0');

    // Build where clause based on filters
    const where: any = {
      price: {
        gte: minPrice,
        lte: maxPrice,
      },
    };

    if (businessId) where.businessId = businessId;
    if (tier) where.tier = tier;

    const services = await prisma.service.findMany({
      where,
      include: {
        business: {
          select: {
            id: true,
            name: true,
            address: true,
            lat: true,
            lng: true,
          },
        },
        _count: {
          select: {
            bookings: true,
          },
        },
      },
      orderBy: [
        { tier: 'asc' }, // Basic first, then Premium, then Luxury
        { price: 'asc' },
      ],
      take: limit,
      skip: offset,
    });

    // Get total count for pagination
    const total = await prisma.service.count({ where });

    return NextResponse.json({
      services,
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + limit < total,
      },
    });
  } catch (error) {
    console.error('Error fetching services:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
});

// POST /api/services - Create a new service (requires OPERATOR or ADMIN role)
export const POST = requireOperator(async (request: NextRequest, user: JwtPayload) => {
  try {
    const body = await request.json();
    
    // Validate request body
    const validatedData = createServiceSchema.parse(body);

    // Check if business exists
    const business = await prisma.business.findUnique({
      where: { id: validatedData.businessId },
      include: {
        owner: {
          select: {
            id: true,
            role: true,
          },
        },
      },
    });

    if (!business) {
      return NextResponse.json(
        { error: 'Business not found' },
        { status: 404 }
      );
    }

    // Authorization check: Only the business owner or admin can create services
    if (business.ownerId !== user.userId && user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'You can only create services for businesses you own' },
        { status: 403 }
      );
    }

    // Check for duplicate service names within the same business
    const existingService = await prisma.service.findFirst({
      where: {
        businessId: validatedData.businessId,
        name: validatedData.name,
      },
    });

    if (existingService) {
      return NextResponse.json(
        { error: 'A service with this name already exists for this business' },
        { status: 409 }
      );
    }

    // Create the service
    const service = await prisma.service.create({
      data: {
        businessId: validatedData.businessId,
        name: validatedData.name,
        description: validatedData.description,
        price: validatedData.price,
        duration: validatedData.duration,
        tier: validatedData.tier,
      },
      include: {
        business: {
          select: {
            id: true,
            name: true,
            address: true,
            lat: true,
            lng: true,
          },
        },
      },
    });

    return NextResponse.json(service, { status: 201 });
  } catch (error) {
    console.error('Error creating service:', error);

    // Handle validation errors
    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Invalid input data', details: error.message },
        { status: 400 }
      );
    }

    // Handle Prisma errors
    if (error instanceof Error && error.message.includes('Foreign key constraint')) {
      return NextResponse.json(
        { error: 'Business not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}); 