import { PrismaClient, UserRole, VehicleType, BookingStatus } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // Clean existing data
  await prisma.booking.deleteMany();
  await prisma.service.deleteMany();
  await prisma.operator.deleteMany();
  await prisma.session.deleteMany();
  await prisma.user.deleteMany();

  // Create admin user
  const adminPassword = await bcrypt.hash('admin123', 10);
  const admin = await prisma.user.create({
    data: {
      email: 'admin@washify.com',
      name: 'Admin User',
      password: adminPassword,
      role: UserRole.ADMIN,
    },
  });

  // Create operator users
  const operatorPassword = await bcrypt.hash('operator123', 10);
  const operator1 = await prisma.user.create({
    data: {
      email: 'mike@sparklewash.com',
      name: 'Mike Johnson',
      password: operatorPassword,
      role: UserRole.OPERATOR,
    },
  });

  const operator2 = await prisma.user.create({
    data: {
      email: 'sarah@premiumclean.com',
      name: 'Sarah Davis',
      password: operatorPassword,
      role: UserRole.OPERATOR,
    },
  });

  // Create consumer users
  const consumerPassword = await bcrypt.hash('consumer123', 10);
  const consumer1 = await prisma.user.create({
    data: {
      email: 'john.doe@example.com',
      name: 'John Doe',
      password: consumerPassword,
      role: UserRole.CONSUMER,
    },
  });

  const consumer2 = await prisma.user.create({
    data: {
      email: 'jane.smith@example.com',
      name: 'Jane Smith',
      password: consumerPassword,
      role: UserRole.CONSUMER,
    },
  });

  // Create operator profiles
  const sparkleWash = await prisma.operator.create({
    data: {
      userId: operator1.id,
      businessName: 'Sparkle Wash',
      description: 'Premium car detailing and wash services with eco-friendly products.',
      address: '123 Main Street',
      city: 'San Francisco',
      state: 'CA',
      zipCode: '94102',
      latitude: 37.7749,
      longitude: -122.4194,
      rating: 4.8,
      totalBookings: 150,
    },
  });

  const premiumClean = await prisma.operator.create({
    data: {
      userId: operator2.id,
      businessName: 'Premium Clean Auto',
      description: 'Professional car wash and detailing with mobile service options.',
      address: '456 Oak Avenue',
      city: 'San Francisco',
      state: 'CA',
      zipCode: '94103',
      latitude: 37.7849,
      longitude: -122.4094,
      rating: 4.6,
      totalBookings: 89,
    },
  });

  // Create services
  const services = await Promise.all([
    // Sparkle Wash Services
    prisma.service.create({
      data: {
        operatorId: sparkleWash.id,
        name: 'Basic Wash',
        description: 'Exterior wash with soap and rinse',
        price: 1500, // $15.00 in cents
        duration: 30,
      },
    }),
    prisma.service.create({
      data: {
        operatorId: sparkleWash.id,
        name: 'Premium Wash',
        description: 'Exterior wash, tire cleaning, and interior vacuum',
        price: 2500, // $25.00 in cents
        duration: 45,
      },
    }),
    prisma.service.create({
      data: {
        operatorId: sparkleWash.id,
        name: 'Full Detail',
        description: 'Complete interior and exterior detailing with wax',
        price: 7500, // $75.00 in cents
        duration: 120,
      },
    }),
    // Premium Clean Services
    prisma.service.create({
      data: {
        operatorId: premiumClean.id,
        name: 'Express Wash',
        description: 'Quick exterior wash and dry',
        price: 1200, // $12.00 in cents
        duration: 20,
      },
    }),
    prisma.service.create({
      data: {
        operatorId: premiumClean.id,
        name: 'Deluxe Wash',
        description: 'Exterior wash, interior clean, and tire shine',
        price: 3000, // $30.00 in cents
        duration: 60,
      },
    }),
    prisma.service.create({
      data: {
        operatorId: premiumClean.id,
        name: 'Mobile Detail',
        description: 'Full detailing service at your location',
        price: 9000, // $90.00 in cents
        duration: 150,
      },
    }),
  ]);

  // Create sample bookings
  const bookings = await Promise.all([
    prisma.booking.create({
      data: {
        userId: consumer1.id,
        serviceId: services[1].id, // Premium Wash
        operatorId: sparkleWash.id,
        status: BookingStatus.COMPLETED,
        scheduledAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
        completedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000 + 45 * 60 * 1000),
        totalAmount: 2500,
        vehicleType: VehicleType.SEDAN,
        vehicleMake: 'Toyota',
        vehicleModel: 'Camry',
        vehicleYear: 2020,
        vehicleColor: 'Silver',
        vehicleLicensePlate: 'ABC123',
        address: '789 Pine Street',
        city: 'San Francisco',
        state: 'CA',
        zipCode: '94104',
        latitude: 37.7849,
        longitude: -122.4094,
      },
    }),
    prisma.booking.create({
      data: {
        userId: consumer2.id,
        serviceId: services[4].id, // Deluxe Wash
        operatorId: premiumClean.id,
        status: BookingStatus.CONFIRMED,
        scheduledAt: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 days from now
        totalAmount: 3000,
        vehicleType: VehicleType.SUV,
        vehicleMake: 'Honda',
        vehicleModel: 'CR-V',
        vehicleYear: 2021,
        vehicleColor: 'Black',
        vehicleLicensePlate: 'XYZ789',
        address: '321 Elm Street',
        city: 'San Francisco',
        state: 'CA',
        zipCode: '94105',
        latitude: 37.7949,
        longitude: -122.3994,
      },
    }),
    prisma.booking.create({
      data: {
        userId: consumer1.id,
        serviceId: services[0].id, // Basic Wash
        operatorId: sparkleWash.id,
        status: BookingStatus.PENDING,
        scheduledAt: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000), // 1 day from now
        totalAmount: 1500,
        vehicleType: VehicleType.SEDAN,
        vehicleMake: 'Toyota',
        vehicleModel: 'Camry',
        vehicleYear: 2020,
        vehicleColor: 'Silver',
        vehicleLicensePlate: 'ABC123',
        address: '789 Pine Street',
        city: 'San Francisco',
        state: 'CA',
        zipCode: '94104',
        latitude: 37.7849,
        longitude: -122.4094,
      },
    }),
  ]);

  console.log('✅ Database seeded successfully!');
  console.log(`👤 Created ${await prisma.user.count()} users`);
  console.log(`🏪 Created ${await prisma.operator.count()} operators`);
  console.log(`🔧 Created ${await prisma.service.count()} services`);
  console.log(`📅 Created ${await prisma.booking.count()} bookings`);
  
  console.log('\n📋 Test Accounts:');
  console.log('Admin: admin@washify.com / admin123');
  console.log('Operator 1: mike@sparklewash.com / operator123');
  console.log('Operator 2: sarah@premiumclean.com / operator123');
  console.log('Consumer 1: john.doe@example.com / consumer123');
  console.log('Consumer 2: jane.smith@example.com / consumer123');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error('❌ Seed failed:', e);
    await prisma.$disconnect();
    process.exit(1);
  }); 