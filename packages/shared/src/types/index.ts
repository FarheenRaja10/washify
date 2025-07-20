// User types
export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  createdAt: Date;
  updatedAt: Date;
}

export type UserRole = 'CONSUMER' | 'OPERATOR' | 'ADMIN';

// Booking types
export interface Booking {
  id: string;
  userId: string;
  serviceId: string;
  operatorId: string;
  status: BookingStatus;
  scheduledAt: Date;
  completedAt?: Date;
  vehicleInfo: VehicleInfo;
  location: Location;
  totalAmount: number;
  createdAt: Date;
  updatedAt: Date;
}

export type BookingStatus = 
  | 'PENDING' 
  | 'CONFIRMED' 
  | 'IN_PROGRESS' 
  | 'COMPLETED' 
  | 'CANCELLED';

// Service types
export interface Service {
  id: string;
  operatorId: string;
  name: string;
  description: string;
  price: number;
  duration: number; // in minutes
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Vehicle types
export interface VehicleInfo {
  type: VehicleType;
  make?: string;
  model?: string;
  year?: number;
  color?: string;
  licensePlate?: string;
}

export type VehicleType = 'SEDAN' | 'SUV' | 'TRUCK' | 'MOTORCYCLE' | 'OTHER';

// Location types
export interface Location {
  address: string;
  city: string;
  state: string;
  zipCode: string;
  latitude?: number;
  longitude?: number;
}

// Operator types
export interface Operator {
  id: string;
  userId: string;
  businessName: string;
  description?: string;
  location: Location;
  isActive: boolean;
  rating: number;
  totalBookings: number;
  createdAt: Date;
  updatedAt: Date;
}

// API Response types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Authentication types
export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: UserRole;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  name: string;
  role: UserRole;
} 