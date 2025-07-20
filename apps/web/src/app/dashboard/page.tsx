import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@washify/db';
import { formatCurrency } from '@/lib/utils';
import { Calendar, DollarSign, Users, Car } from 'lucide-react';

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect('/auth/signin');
  }

  // Get dashboard stats
  const stats = await getDashboardStats(session.user.operatorId);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
              <p className="text-gray-600">Welcome back, {session.user.name}!</p>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-500">
                Role: {session.user.role}
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-8">
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Calendar className="h-6 w-6 text-gray-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Total Bookings
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {stats.totalBookings}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <DollarSign className="h-6 w-6 text-gray-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Total Revenue
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {formatCurrency(stats.totalRevenue)}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Users className="h-6 w-6 text-gray-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Active Customers
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {stats.activeCustomers}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Car className="h-6 w-6 text-gray-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Services
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {stats.activeServices}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Welcome Message */}
        <div className="bg-white shadow rounded-lg mb-8">
          <div className="px-6 py-8">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Welcome to Washify! 🚗
              </h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Your car wash management dashboard is ready. Here you can manage your
                bookings, services, customers, and track your business performance.
              </p>
              <div className="mt-6 flex justify-center space-x-4">
                <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md">
                  Create Service
                </button>
                <button className="bg-gray-200 hover:bg-gray-300 text-gray-900 px-6 py-2 rounded-md">
                  View Bookings
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Quick Actions</h3>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <button className="flex items-center justify-center px-4 py-6 border border-gray-300 rounded-lg hover:bg-gray-50">
                <Calendar className="h-8 w-8 text-blue-600 mr-3" />
                <span className="text-gray-900 font-medium">Manage Bookings</span>
              </button>
              <button className="flex items-center justify-center px-4 py-6 border border-gray-300 rounded-lg hover:bg-gray-50">
                <Car className="h-8 w-8 text-green-600 mr-3" />
                <span className="text-gray-900 font-medium">Manage Services</span>
              </button>
              <button className="flex items-center justify-center px-4 py-6 border border-gray-300 rounded-lg hover:bg-gray-50">
                <Users className="h-8 w-8 text-purple-600 mr-3" />
                <span className="text-gray-900 font-medium">View Customers</span>
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

async function getDashboardStats(operatorId?: string) {
  if (!operatorId) {
    return {
      totalBookings: 0,
      totalRevenue: 0,
      activeCustomers: 0,
      activeServices: 0,
    };
  }

  try {
    const [bookings, services, customers] = await Promise.all([
      prisma.booking.findMany({
        where: { operatorId },
        select: { totalAmount: true, userId: true },
      }),
      prisma.service.count({
        where: { operatorId, isActive: true },
      }),
      prisma.booking.findMany({
        where: { operatorId },
        select: { userId: true },
        distinct: ['userId'],
      }),
    ]);

    return {
      totalBookings: bookings.length,
      totalRevenue: bookings.reduce((sum, booking) => sum + booking.totalAmount, 0),
      activeCustomers: customers.length,
      activeServices: services,
    };
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    return {
      totalBookings: 0,
      totalRevenue: 0,
      activeCustomers: 0,
      activeServices: 0,
    };
  }
} 