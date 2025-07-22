import { z } from 'zod';

// Authentication validation schemas
export const signupSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  role: z.enum(['CUSTOMER', 'OPERATOR', 'ADMIN']).default('CUSTOMER'),
  phone: z.string().optional(),
});

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

// Booking validation schemas
export const createBookingSchema = z.object({
  userId: z.string().uuid('Invalid user ID'),
  businessId: z.string().uuid('Invalid business ID'),
  serviceId: z.string().uuid('Invalid service ID'),
  scheduledAt: z.string().datetime('Invalid date format'),
  notes: z.string().optional(),
  photos: z.array(z.string().url('Invalid photo URL')).optional(),
});

export const updateBookingSchema = z.object({
  status: z.enum(['PENDING', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED']).optional(),
  notes: z.string().optional(),
  photos: z.array(z.string().url('Invalid photo URL')).optional(),
});

// Service validation schemas
export const createServiceSchema = z.object({
  businessId: z.string().uuid('Invalid business ID'),
  name: z.string().min(1, 'Service name is required'),
  description: z.string().min(1, 'Service description is required'),
  price: z.number().positive('Price must be positive'),
  duration: z.number().int().positive('Duration must be a positive integer'),
  tier: z.enum(['BASIC', 'PREMIUM', 'LUXURY']),
});

// Business validation schemas
export const createBusinessSchema = z.object({
  name: z.string().min(1, 'Business name is required'),
  address: z.string().min(1, 'Address is required'),
  lat: z.number().min(-90).max(90, 'Invalid latitude'),
  lng: z.number().min(-180).max(180, 'Invalid longitude'),
  ownerId: z.string().uuid('Invalid owner ID'),
});

// Payment validation schemas
export const createPaymentSchema = z.object({
  bookingId: z.string().uuid('Invalid booking ID'),
  amount: z.number().positive('Amount must be positive'),
  currency: z.string().default('USD'),
  provider: z.string().min(1, 'Payment provider is required'),
  providerId: z.string().optional(),
});

// Review validation schemas
export const createReviewSchema = z.object({
  userId: z.string().uuid('Invalid user ID'),
  bookingId: z.string().uuid('Invalid booking ID'),
  rating: z.number().int().min(1).max(5, 'Rating must be between 1 and 5'),
  comment: z.string().optional(),
});

// Type exports
export type SignupInput = z.infer<typeof signupSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type CreateBookingInput = z.infer<typeof createBookingSchema>;
export type UpdateBookingInput = z.infer<typeof updateBookingSchema>;
export type CreateServiceInput = z.infer<typeof createServiceSchema>;
export type CreateBusinessInput = z.infer<typeof createBusinessSchema>;
export type CreatePaymentInput = z.infer<typeof createPaymentSchema>;
export type CreateReviewInput = z.infer<typeof createReviewSchema>; 