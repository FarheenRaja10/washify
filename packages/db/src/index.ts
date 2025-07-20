import { PrismaClient } from '@prisma/client';

// Extend Prisma Client with custom methods if needed
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: ['query'],
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

// Export types
export type {
  User,
  Operator,
  Service,
  Booking,
  Session,
  UserRole,
  BookingStatus,
  VehicleType,
} from '@prisma/client';

// Database utilities
export const connectDB = async () => {
  try {
    await prisma.$connect();
    console.log('✅ Database connected successfully');
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    process.exit(1);
  }
};

export const disconnectDB = async () => {
  await prisma.$disconnect();
};

// Health check
export const healthCheck = async () => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return { status: 'healthy', timestamp: new Date().toISOString() };
  } catch (error) {
    return { status: 'unhealthy', error: error, timestamp: new Date().toISOString() };
  }
};

export default prisma; 