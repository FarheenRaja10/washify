import { z } from 'zod';

// User schemas
export const UserRoleSchema = z.enum(['CONSUMER', 'OPERATOR', 'ADMIN']);

export const UserSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  name: z.string().min(1),
  role: UserRoleSchema,
  createdAt: z.date(),
  updatedAt: z.date(),
});

// Authentication schemas
export const LoginRequestSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export const RegisterRequestSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  name: z.string().min(1),
  role: UserRoleSchema,
});

// Vehicle schemas
export const VehicleTypeSchema = z.enum(['SEDAN', 'SUV', 'TRUCK', 'MOTORCYCLE', 'OTHER']);

export const VehicleInfoSchema = z.object({
  type: VehicleTypeSchema,
  make: z.string().optional(),
  model: z.string().optional(),
  year: z.number().int().min(1900).max(new Date().getFullYear() + 1).optional(),
  color: z.string().optional(),
  licensePlate: z.string().optional(),
});

// Location schemas
export const LocationSchema = z.object({
  address: z.string().min(1),
  city: z.string().min(1),
  state: z.string().min(1),
  zipCode: z.string().min(5),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
});

// Booking schemas
export const BookingStatusSchema = z.enum([
  'PENDING',
  'CONFIRMED', 
  'IN_PROGRESS',
  'COMPLETED',
  'CANCELLED'
]);

export const BookingSchema = z.object({
  id: z.string(),
  userId: z.string(),
  serviceId: z.string(),
  operatorId: z.string(),
  status: BookingStatusSchema,
  scheduledAt: z.date(),
  completedAt: z.date().optional(),
  vehicleInfo: VehicleInfoSchema,
  location: LocationSchema,
  totalAmount: z.number().min(0),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const CreateBookingSchema = z.object({
  serviceId: z.string(),
  scheduledAt: z.string().datetime(),
  vehicleInfo: VehicleInfoSchema,
  location: LocationSchema,
});

// Service schemas
export const ServiceSchema = z.object({
  id: z.string(),
  operatorId: z.string(),
  name: z.string().min(1),
  description: z.string(),
  price: z.number().min(0),
  duration: z.number().int().min(15),
  isActive: z.boolean(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const CreateServiceSchema = z.object({
  name: z.string().min(1),
  description: z.string(),
  price: z.number().min(0),
  duration: z.number().int().min(15),
});

// Operator schemas
export const OperatorSchema = z.object({
  id: z.string(),
  userId: z.string(),
  businessName: z.string().min(1),
  description: z.string().optional(),
  location: LocationSchema,
  isActive: z.boolean(),
  rating: z.number().min(0).max(5),
  totalBookings: z.number().int().min(0),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const CreateOperatorSchema = z.object({
  businessName: z.string().min(1),
  description: z.string().optional(),
  location: LocationSchema,
});

// API Response schemas
export const ApiResponseSchema = z.object({
  success: z.boolean(),
  data: z.any().optional(),
  error: z.string().optional(),
  message: z.string().optional(),
});

export const PaginationSchema = z.object({
  page: z.number().int().min(1),
  limit: z.number().int().min(1).max(100),
  total: z.number().int().min(0),
  totalPages: z.number().int().min(0),
});

export const PaginatedResponseSchema = ApiResponseSchema.extend({
  pagination: PaginationSchema,
}); 