import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import Link from 'next/link';
import { Car, Users, Calendar, Star } from 'lucide-react';

export default async function HomePage() {
  const session = await getServerSession(authOptions);

  // Redirect authenticated users to dashboard
  if (session) {
    redirect('/dashboard');
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-2">
              <Car className="h-8 w-8 text-blue-600" />
              <span className="text-2xl font-bold text-gray-900">Washify</span>
            </div>
            <nav className="flex items-center space-x-4">
              <Link
                href="/auth/signin"
                className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
              >
                Sign In
              </Link>
              <Link
                href="/auth/signup"
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium"
              >
                Get Started
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center">
          <h1 className="text-4xl font-extrabold text-gray-900 sm:text-5xl lg:text-6xl">
            Professional Car Wash
            <span className="text-blue-600"> Management</span>
          </h1>
          <p className="mt-6 max-w-2xl mx-auto text-xl text-gray-600">
            Streamline your car wash business with our comprehensive management
            platform. Handle bookings, manage services, and grow your customer base.
          </p>
          <div className="mt-10 flex justify-center space-x-4">
            <Link
              href="/auth/signup"
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg text-lg font-medium"
            >
              Start Your Free Trial
            </Link>
            <Link
              href="#features"
              className="bg-white hover:bg-gray-50 text-gray-900 px-8 py-3 rounded-lg text-lg font-medium border border-gray-300"
            >
              Learn More
            </Link>
          </div>
        </div>

        {/* Features */}
        <div id="features" className="mt-24">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold text-gray-900">
              Everything you need to manage your car wash business
            </h2>
            <p className="mt-4 max-w-2xl mx-auto text-lg text-gray-600">
              From booking management to customer communication, we've got you covered.
            </p>
          </div>

          <div className="mt-16 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center justify-center h-12 w-12 rounded-md bg-blue-500 text-white mx-auto">
                <Calendar className="h-6 w-6" />
              </div>
              <div className="mt-6 text-center">
                <h3 className="text-lg font-medium text-gray-900">
                  Booking Management
                </h3>
                <p className="mt-2 text-gray-600">
                  Easily manage appointments, track schedules, and handle cancellations
                  all in one place.
                </p>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center justify-center h-12 w-12 rounded-md bg-blue-500 text-white mx-auto">
                <Users className="h-6 w-6" />
              </div>
              <div className="mt-6 text-center">
                <h3 className="text-lg font-medium text-gray-900">
                  Customer Management
                </h3>
                <p className="mt-2 text-gray-600">
                  Keep track of your customers, their preferences, and booking history
                  for better service.
                </p>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center justify-center h-12 w-12 rounded-md bg-blue-500 text-white mx-auto">
                <Star className="h-6 w-6" />
              </div>
              <div className="mt-6 text-center">
                <h3 className="text-lg font-medium text-gray-900">
                  Service Management
                </h3>
                <p className="mt-2 text-gray-600">
                  Define your services, set pricing, and manage availability with
                  flexible options.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Car className="h-6 w-6 text-blue-600" />
              <span className="text-lg font-semibold text-gray-900">Washify</span>
            </div>
            <p className="text-gray-600 text-sm">
              © 2023 Washify. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
} 