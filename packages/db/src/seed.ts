import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting Washify database seeding...');

  // Clear existing data (in correct order to avoid foreign key constraints)
  console.log('🧹 Cleaning existing data...');
  await prisma.review.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.booking.deleteMany();
  await prisma.service.deleteMany();
  await prisma.business.deleteMany();
  await prisma.user.deleteMany();

  // ========================================
  // 1. CREATE USERS (5 total)
  // ========================================
  console.log('👥 Creating users...');
  
  const password = await bcrypt.hash('password123', 12);
  
  const users = await Promise.all([
    // 1 Admin
    prisma.user.create({
      data: {
        name: 'Admin User',
        email: 'admin@washify.com',
        password,
        role: 'ADMIN',
        phone: '+1-555-0001',
      },
    }),
    
    // 2 Operators
    prisma.user.create({
      data: {
        name: 'Sarah Johnson',
        email: 'sarah@sparklewash.com',
        password,
        role: 'OPERATOR',
        phone: '+1-555-0002',
      },
    }),
    
    prisma.user.create({
      data: {
        name: 'Mike Rodriguez',
        email: 'mike@superwash.com',
        password,
        role: 'OPERATOR',
        phone: '+1-555-0003',
      },
    }),
    
    // 2 Customers
    prisma.user.create({
      data: {
        name: 'Emily Chen',
        email: 'emily.chen@gmail.com',
        password,
        role: 'CUSTOMER',
        phone: '+1-555-0004',
      },
    }),
    
    prisma.user.create({
      data: {
        name: 'David Thompson',
        email: 'david.thompson@hotmail.com',
        password,
        role: 'CUSTOMER',
        phone: '+1-555-0005',
      },
    }),
  ]);

  const [admin, operator1, operator2, customer1, customer2] = users;
  console.log(`✅ Created ${users.length} users`);

  // ========================================
  // 2. CREATE BUSINESSES (10 total)
  // ========================================
  console.log('🏢 Creating businesses...');
  
  const businesses = await Promise.all([
    // Operator 1 businesses (5)
    prisma.business.create({
      data: {
        name: 'Sparkle Car Wash Downtown',
        address: '123 Main St, New York, NY 10001',
        lat: 40.7831,
        lng: -73.9712,
        ownerId: operator1.id,
      },
    }),
    
    prisma.business.create({
      data: {
        name: 'Sparkle Express Midtown',
        address: '456 Broadway, New York, NY 10013',
        lat: 40.7505,
        lng: -73.9934,
        ownerId: operator1.id,
      },
    }),
    
    prisma.business.create({
      data: {
        name: 'Sparkle Premium Uptown',
        address: '789 Park Ave, New York, NY 10021',
        lat: 40.7747,
        lng: -73.9654,
        ownerId: operator1.id,
      },
    }),
    
    prisma.business.create({
      data: {
        name: 'Sparkle Quick Brooklyn',
        address: '321 Atlantic Ave, Brooklyn, NY 11201',
        lat: 40.6892,
        lng: -73.9940,
        ownerId: operator1.id,
      },
    }),
    
    prisma.business.create({
      data: {
        name: 'Sparkle Deluxe Queens',
        address: '654 Northern Blvd, Queens, NY 11377',
        lat: 40.7505,
        lng: -73.8370,
        ownerId: operator1.id,
      },
    }),
    
    // Operator 2 businesses (5)
    prisma.business.create({
      data: {
        name: 'Super Wash Central',
        address: '111 5th Ave, New York, NY 10003',
        lat: 40.7352,
        lng: -73.9910,
        ownerId: operator2.id,
      },
    }),
    
    prisma.business.create({
      data: {
        name: 'Super Wash Express',
        address: '222 Lexington Ave, New York, NY 10016',
        lat: 40.7450,
        lng: -73.9807,
        ownerId: operator2.id,
      },
    }),
    
    prisma.business.create({
      data: {
        name: 'Super Wash Premium',
        address: '333 Madison Ave, New York, NY 10017',
        lat: 40.7549,
        lng: -73.9756,
        ownerId: operator2.id,
      },
    }),
    
    prisma.business.create({
      data: {
        name: 'Super Wash Bronx',
        address: '444 Grand Concourse, Bronx, NY 10451',
        lat: 40.8176,
        lng: -73.9263,
        ownerId: operator2.id,
      },
    }),
    
    prisma.business.create({
      data: {
        name: 'Super Wash Staten Island',
        address: '555 Richmond Ave, Staten Island, NY 10314',
        lat: 40.5795,
        lng: -74.1502,
        ownerId: operator2.id,
      },
    }),
  ]);

  console.log(`✅ Created ${businesses.length} businesses`);

  // ========================================
  // 3. CREATE SERVICES (3 per business = 30 total)
  // ========================================
  console.log('🔧 Creating services...');
  
  const serviceTemplates = [
    { name: 'Basic Wash', description: 'Exterior wash only', price: 15.99, duration: 20, tier: 'BASIC' as const },
    { name: 'Premium Wash', description: 'Exterior wash + interior vacuum', price: 29.99, duration: 45, tier: 'PREMIUM' as const },
    { name: 'Luxury Detail', description: 'Full service with wax and interior detail', price: 59.99, duration: 90, tier: 'LUXURY' as const },
  ];

  const services = [];
  for (const business of businesses) {
    for (const template of serviceTemplates) {
      const service = await prisma.service.create({
        data: {
          businessId: business.id,
          name: template.name,
          description: template.description,
          price: template.price,
          duration: template.duration,
          tier: template.tier,
        },
      });
      services.push(service);
    }
  }

  console.log(`✅ Created ${services.length} services`);

  // ========================================
  // 4. CREATE BOOKINGS (Multiple with different statuses)
  // ========================================
  console.log('📅 Creating bookings...');
  
  const bookings = await Promise.all([
    // Customer 1 bookings
    prisma.booking.create({
      data: {
        userId: customer1.id,
        businessId: businesses[0].id, // Sparkle Downtown
        serviceId: services[1].id, // Premium Wash
        scheduledAt: new Date('2024-01-20T10:00:00Z'),
        status: 'COMPLETED',
        notes: 'Please focus on the wheels',
        photos: ['https://example.com/before1.jpg', 'https://example.com/after1.jpg'],
      },
    }),
    
    prisma.booking.create({
      data: {
        userId: customer1.id,
        businessId: businesses[5].id, // Super Wash Central
        serviceId: services[17].id, // Luxury Detail
        scheduledAt: new Date('2024-01-25T14:00:00Z'),
        status: 'PENDING',
        notes: 'First time customer',
      },
    }),
    
    // Customer 2 bookings
    prisma.booking.create({
      data: {
        userId: customer2.id,
        businessId: businesses[2].id, // Sparkle Premium
        serviceId: services[8].id, // Luxury Detail
        scheduledAt: new Date('2024-01-22T09:00:00Z'),
        status: 'IN_PROGRESS',
        notes: 'Regular monthly cleaning',
      },
    }),
    
    prisma.booking.create({
      data: {
        userId: customer2.id,
        businessId: businesses[1].id, // Sparkle Express
        serviceId: services[3].id, // Basic Wash
        scheduledAt: new Date('2024-01-18T16:30:00Z'),
        status: 'COMPLETED',
        notes: 'Quick wash before meeting',
      },
    }),
    
    // Additional booking for variety
    prisma.booking.create({
      data: {
        userId: customer1.id,
        businessId: businesses[7].id, // Super Wash Premium
        serviceId: services[23].id, // Premium Wash
        scheduledAt: new Date('2024-01-15T11:00:00Z'),
        status: 'COMPLETED',
        notes: 'Excellent service as always',
      },
    }),
  ]);

  console.log(`✅ Created ${bookings.length} bookings`);

  // ========================================
  // 5. CREATE PAYMENTS (for completed bookings)
  // ========================================
  console.log('💳 Creating payments...');
  
  const completedBookings = bookings.filter(b => b.status === 'COMPLETED');
  const payments = [];
  
  for (let i = 0; i < completedBookings.length; i++) {
    const booking = completedBookings[i];
    const service = services.find(s => s.id === booking.serviceId);
    
    const payment = await prisma.payment.create({
      data: {
        bookingId: booking.id,
        amount: service!.price,
        currency: 'USD',
        status: 'PAID',
        provider: i === 0 ? 'stripe' : i === 1 ? 'paypal' : 'cash',
        providerId: i === 0 ? 'pi_1234567890' : i === 1 ? 'PAYID-ABC123' : null,
        paidAt: new Date(),
      },
    });
    payments.push(payment);
  }

  console.log(`✅ Created ${payments.length} payments`);

  // ========================================
  // 6. CREATE REVIEWS (for completed bookings)
  // ========================================
  console.log('⭐ Creating reviews...');
  
  const reviews = await Promise.all([
    prisma.review.create({
      data: {
        userId: customer1.id,
        bookingId: completedBookings[0].id,
        rating: 5,
        comment: 'Amazing service! My car looks brand new. The staff was very professional and thorough.',
      },
    }),
    
    prisma.review.create({
      data: {
        userId: customer2.id,
        bookingId: completedBookings[1].id,
        rating: 4,
        comment: 'Good service overall. Quick and efficient. Will definitely come back.',
      },
    }),
    
    prisma.review.create({
      data: {
        userId: customer1.id,
        bookingId: completedBookings[2].id,
        rating: 5,
        comment: 'Exceeded my expectations! The premium wash was worth every penny.',
      },
    }),
  ]);

  console.log(`✅ Created ${reviews.length} reviews`);

  // ========================================
  // SUMMARY
  // ========================================
  console.log('\n🎉 Seeding completed successfully!');
  console.log('\n📊 Summary:');
  console.log(`   👥 Users: ${users.length} (1 Admin, 2 Operators, 2 Customers)`);
  console.log(`   🏢 Businesses: ${businesses.length} (5 per operator)`);
  console.log(`   🔧 Services: ${services.length} (3 per business)`);
  console.log(`   📅 Bookings: ${bookings.length} (mixed statuses)`);
  console.log(`   💳 Payments: ${payments.length} (for completed bookings)`);
  console.log(`   ⭐ Reviews: ${reviews.length} (high ratings)`);
  
  console.log('\n🔐 Test Accounts:');
  console.log('   Admin:     admin@washify.com / password123');
  console.log('   Operator:  sarah@sparklewash.com / password123');
  console.log('   Operator:  mike@superwash.com / password123');
  console.log('   Customer:  emily.chen@gmail.com / password123');
  console.log('   Customer:  david.thompson@hotmail.com / password123');
  
  console.log('\n🧪 Perfect for testing:');
  console.log('   • Authentication & role-based access');
  console.log('   • Geolocation business search');
  console.log('   • Service listings and filtering');
  console.log('   • Booking flow with different statuses');
  console.log('   • Payment processing integration');
  console.log('   • Review and rating systems');
  console.log('   • Admin user management');
  console.log('   • Operator business ownership');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 