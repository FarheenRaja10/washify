// API Constants
export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    LOGOUT: '/auth/logout',
    REFRESH: '/auth/refresh',
    PROFILE: '/auth/profile',
  },
  USERS: {
    BASE: '/users',
    BY_ID: (id: string) => `/users/${id}`,
  },
  BOOKINGS: {
    BASE: '/bookings',
    BY_ID: (id: string) => `/bookings/${id}`,
    BY_USER: (userId: string) => `/bookings/user/${userId}`,
    BY_OPERATOR: (operatorId: string) => `/bookings/operator/${operatorId}`,
  },
  SERVICES: {
    BASE: '/services',
    BY_ID: (id: string) => `/services/${id}`,
    BY_OPERATOR: (operatorId: string) => `/services/operator/${operatorId}`,
  },
  OPERATORS: {
    BASE: '/operators',
    BY_ID: (id: string) => `/operators/${id}`,
    BY_USER: (userId: string) => `/operators/user/${userId}`,
  },
} as const;

// App Configuration
export const APP_CONFIG = {
  NAME: 'Washify',
  DESCRIPTION: 'Car wash platform connecting consumers with operators',
  VERSION: '1.0.0',
  AUTHOR: 'Washify Team',
  CONTACT_EMAIL: 'support@washify.com',
  WEBSITE: 'https://washify.com',
} as const;

// Pagination
export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 10,
  MAX_LIMIT: 100,
} as const;

// User Roles
export const USER_ROLES = {
  CONSUMER: 'CONSUMER',
  OPERATOR: 'OPERATOR',
  ADMIN: 'ADMIN',
} as const;

// Booking Status
export const BOOKING_STATUS = {
  PENDING: 'PENDING',
  CONFIRMED: 'CONFIRMED',
  IN_PROGRESS: 'IN_PROGRESS',
  COMPLETED: 'COMPLETED',
  CANCELLED: 'CANCELLED',
} as const;

// Vehicle Types
export const VEHICLE_TYPES = {
  SEDAN: 'SEDAN',
  SUV: 'SUV',
  TRUCK: 'TRUCK',
  MOTORCYCLE: 'MOTORCYCLE',
  OTHER: 'OTHER',
} as const;

// Service Duration (in minutes)
export const SERVICE_DURATION = {
  MIN: 15,
  MAX: 480, // 8 hours
  DEFAULT: 60,
} as const;

// Price Limits
export const PRICE_LIMITS = {
  MIN: 0,
  MAX: 10000, // $100.00
} as const;

// File Upload
export const FILE_UPLOAD = {
  MAX_SIZE: 5 * 1024 * 1024, // 5MB
  ALLOWED_TYPES: ['image/jpeg', 'image/png', 'image/webp'],
  ALLOWED_EXTENSIONS: ['.jpg', '.jpeg', '.png', '.webp'],
} as const;

// Error Messages
export const ERROR_MESSAGES = {
  UNAUTHORIZED: 'Unauthorized access',
  FORBIDDEN: 'Access forbidden',
  NOT_FOUND: 'Resource not found',
  VALIDATION_ERROR: 'Validation error',
  INTERNAL_ERROR: 'Internal server error',
  INVALID_CREDENTIALS: 'Invalid email or password',
  EMAIL_ALREADY_EXISTS: 'Email already exists',
  BOOKING_NOT_AVAILABLE: 'Booking slot not available',
  INVALID_FILE_TYPE: 'Invalid file type',
  FILE_TOO_LARGE: 'File size too large',
} as const;

// Success Messages
export const SUCCESS_MESSAGES = {
  LOGIN_SUCCESS: 'Login successful',
  REGISTER_SUCCESS: 'Registration successful',
  LOGOUT_SUCCESS: 'Logout successful',
  BOOKING_CREATED: 'Booking created successfully',
  BOOKING_UPDATED: 'Booking updated successfully',
  BOOKING_CANCELLED: 'Booking cancelled successfully',
  SERVICE_CREATED: 'Service created successfully',
  SERVICE_UPDATED: 'Service updated successfully',
  PROFILE_UPDATED: 'Profile updated successfully',
} as const; 