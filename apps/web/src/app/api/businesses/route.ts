import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createBusinessSchema } from '@/lib/validations';

// GET /api/businesses - Discover car wash businesses with geolocation support
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const lat = parseFloat(searchParams.get('lat') || '0');
    const lng = parseFloat(searchParams.get('lng') || '0');
    const radius = parseFloat(searchParams.get('radius') || '10'); // km
    const search = searchParams.get('search');
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = parseInt(searchParams.get('offset') || '0');

    let businesses;
    let total;

    // If coordinates are provided, find businesses within radius
    if (lat !== 0 && lng !== 0) {
      // Using Haversine formula for distance calculation
      // Note: For production, consider using PostGIS for better performance
      const businesses_raw = await prisma.$queryRaw`
        SELECT 
          b.*,
          (
            6371 * acos(
              cos(radians(${lat})) * 
              cos(radians(lat)) * 
              cos(radians(lng) - radians(${lng})) + 
              sin(radians(${lat})) * 
              sin(radians(lat))
            )
          ) AS distance
        FROM businesses b
        WHERE (
          6371 * acos(
            cos(radians(${lat})) * 
            cos(radians(lat)) * 
            cos(radians(lng) - radians(${lng})) + 
            sin(radians(${lat})) * 
            sin(radians(lat))
          )
        ) <= ${radius}
        ${search ? `AND (name ILIKE '%${search}%' OR address ILIKE '%${search}%')` : ''}
        ORDER BY distance ASC
        LIMIT ${limit} OFFSET ${offset}
      `;

      // Get related data for each business
      const businessIds = (businesses_raw as any[]).map(b => b.id);
      const businessDetails = await prisma.business.findMany({
        where: {
          id: {
            in: businessIds,
          },
        },
        include: {
          owner: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          services: {
            select: {
              id: true,
              name: true,
              description: true,
              price: true,
              duration: true,
              tier: true,
            },
            orderBy: {
              price: 'asc',
            },
          },
          _count: {
            select: {
              bookings: true,
            },
          },
        },
      });

      // Merge distance data with business details
      businesses = (businesses_raw as any[]).map(rawBusiness => {
        const details = businessDetails.find(bd => bd.id === rawBusiness.id);
        return {
          ...details,
          distance: parseFloat(rawBusiness.distance.toFixed(2)),
        };
      });

      // Get total count for businesses within radius
      const totalResult = await prisma.$queryRaw`
        SELECT COUNT(*) as count
        FROM businesses b
        WHERE (
          6371 * acos(
            cos(radians(${lat})) * 
            cos(radians(lat)) * 
            cos(radians(lng) - radians(${lng})) + 
            sin(radians(${lat})) * 
            sin(radians(lat))
          )
        ) <= ${radius}
        ${search ? `AND (name ILIKE '%${search}%' OR address ILIKE '%${search}%')` : ''}
      `;
      total = parseInt((totalResult as any[])[0].count);
    } else {
      // Standard search without geolocation
      const where: any = {};
      if (search) {
        where.OR = [
          { name: { contains: search, mode: 'insensitive' } },
          { address: { contains: search, mode: 'insensitive' } },
        ];
      }

      businesses = await prisma.business.findMany({
        where,
        include: {
          owner: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          services: {
            select: {
              id: true,
              name: true,
              description: true,
              price: true,
              duration: true,
              tier: true,
            },
            orderBy: {
              price: 'asc',
            },
          },
          _count: {
            select: {
              bookings: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
        take: limit,
        skip: offset,
      });

      total = await prisma.business.count({ where });
    }

    return NextResponse.json({
      businesses,
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + limit < total,
      },
    });
  } catch (error) {
    console.error('Error fetching businesses:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/businesses - Register a new car wash business
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate request body
    const validatedData = createBusinessSchema.parse(body);

    // Check if user exists and has appropriate role
    const user = await prisma.user.findUnique({
      where: { id: validatedData.ownerId },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    if (user.role !== 'OPERATOR' && user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Only operators and admins can create businesses' },
        { status: 403 }
      );
    }

    // Check for duplicate business names at the same location (within 100m)
    const existingBusiness = await prisma.$queryRaw`
      SELECT id FROM businesses 
      WHERE name = ${validatedData.name}
      AND (
        6371 * acos(
          cos(radians(${validatedData.lat})) * 
          cos(radians(lat)) * 
          cos(radians(lng) - radians(${validatedData.lng})) + 
          sin(radians(${validatedData.lat})) * 
          sin(radians(lat))
        )
      ) <= 0.1
      LIMIT 1
    `;

    if ((existingBusiness as any[]).length > 0) {
      return NextResponse.json(
        { error: 'A business with this name already exists at this location' },
        { status: 409 }
      );
    }

    // Create the business
    const business = await prisma.business.create({
      data: {
        name: validatedData.name,
        address: validatedData.address,
        lat: validatedData.lat,
        lng: validatedData.lng,
        ownerId: validatedData.ownerId,
      },
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
      },
    });

    return NextResponse.json(business, { status: 201 });
  } catch (error) {
    console.error('Error creating business:', error);

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
        { error: 'Owner not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 