# Washify JWT Authentication System

## Overview

This document describes the JWT-based authentication system for the Washify platform. The system provides secure user registration, login, and role-based access control for API endpoints.

## Environment Variables

Add these to your `.env` file:

```bash
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=7d
DATABASE_URL=your-postgresql-connection-string
```

## User Roles

The system supports three user roles:

- **CUSTOMER**: Can book services, leave reviews
- **OPERATOR**: Can manage businesses and services they own
- **ADMIN**: Full system access, can manage all resources

---

## Authentication Endpoints

### POST /api/auth/signup

Register a new user account.

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "securepassword123",
  "role": "CUSTOMER",
  "phone": "+1234567890"
}
```

**Response (201):**
```json
{
  "message": "User created successfully",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "user-uuid",
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "+1234567890",
    "role": "CUSTOMER"
  }
}
```

### POST /api/auth/login

Login with existing credentials.

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "securepassword123"
}
```

**Response (200):**
```json
{
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "user-uuid",
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "+1234567890",
    "role": "CUSTOMER"
  }
}
```

### GET /api/auth/me

Get current user information (requires authentication).

**Headers:**
```
Authorization: Bearer your-jwt-token
```

**Response (200):**
```json
{
  "user": {
    "id": "user-uuid",
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "+1234567890",
    "role": "CUSTOMER",
    "createdAt": "2024-01-01T00:00:00Z",
    "updatedAt": "2024-01-01T00:00:00Z",
    "_count": {
      "ownedBusinesses": 0,
      "bookings": 5,
      "reviews": 3
    }
  },
  "tokenInfo": {
    "userId": "user-uuid",
    "email": "john@example.com",
    "role": "CUSTOMER",
    "issuedAt": "2024-01-01T00:00:00Z",
    "expiresAt": "2024-01-08T00:00:00Z"
  }
}
```

---

## Authentication Middleware

### Available Middleware Functions

```typescript
import {
  requireAuth,
  requireRoles,
  requireAdmin,
  requireOperator,
  requireUser,
  optionalAuth
} from '@/lib/middleware/auth';
```

### Usage Examples

#### Basic Authentication
```typescript
// Requires any authenticated user
export const GET = requireAuth(async (request, user) => {
  // user.userId, user.email, user.role are available
  return NextResponse.json({ message: 'Authenticated!' });
});
```

#### Role-Based Authorization
```typescript
// Requires OPERATOR or ADMIN role
export const POST = requireOperator(async (request, user) => {
  // Only operators and admins can access this
  return NextResponse.json({ message: 'Operator access granted!' });
});

// Requires ADMIN role only
export const DELETE = requireAdmin(async (request, user) => {
  // Only admins can access this
  return NextResponse.json({ message: 'Admin access granted!' });
});

// Custom role requirements
export const PUT = requireRoles(['ADMIN', 'OPERATOR'], async (request, user) => {
  return NextResponse.json({ message: 'Custom role access!' });
});
```

#### Optional Authentication
```typescript
// User info available if authenticated, but not required
export const GET = optionalAuth(async (request, user) => {
  if (user) {
    // User is authenticated
    return NextResponse.json({ message: `Hello ${user.email}!` });
  } else {
    // User is not authenticated
    return NextResponse.json({ message: 'Hello anonymous user!' });
  }
});
```

---

## JWT Token Structure

### Token Payload
```typescript
interface JwtPayload {
  userId: string;
  email: string;
  role: UserRole;
  iat?: number;  // Issued at
  exp?: number;  // Expires at
}
```

### Token Usage in Requests

Include the JWT token in the Authorization header:

```bash
curl -X GET http://localhost:3000/api/auth/me \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

---

## Protected Route Examples

### 1. Services Route (Mixed Access)
```typescript
// GET - Public access with optional auth
export const GET = optionalAuth(async (request, user) => {
  // Anyone can view services
  // Additional user-specific data if authenticated
});

// POST - Requires OPERATOR role
export const POST = requireOperator(async (request, user) => {
  // Only operators can create services
  // Additional check: can only create for owned businesses
});
```

### 2. Admin Route (Admin Only)
```typescript
// GET - Admin only
export const GET = requireAdmin(async (request, user) => {
  // View all users
});

// DELETE - Admin only
export const DELETE = requireAdmin(async (request, user) => {
  // Delete users (with safety checks)
});
```

### 3. User Profile Route (Own Resource)
```typescript
export const GET = requireUser(async (request, user) => {
  const { userId } = request.nextUrl.searchParams;
  
  // Users can only access their own profile (unless admin)
  if (userId !== user.userId && user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Access denied' }, { status: 403 });
  }
  
  // Fetch and return user data
});
```

---

## Security Features

### Password Security
- Passwords hashed with bcrypt (12 salt rounds)
- Passwords never returned in API responses
- Secure password comparison for login

### JWT Security
- Configurable secret key (environment variable)
- Configurable token expiration (default: 7 days)
- Proper token verification with error handling
- Token extraction from Authorization header

### Authorization Levels
- Route-level protection with middleware
- Role-based access control
- Resource ownership validation
- Admin override capabilities

---

## Error Responses

### Authentication Errors
```json
{
  "error": "Authorization token required"
}
```

```json
{
  "error": "Invalid token"
}
```

```json
{
  "error": "Token expired"
}
```

### Authorization Errors
```json
{
  "error": "Access denied. Required roles: OPERATOR, ADMIN"
}
```

```json
{
  "error": "You can only create services for businesses you own"
}
```

---

## Testing Authentication

### 1. Register a User
```bash
curl -X POST http://localhost:3000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "password": "password123",
    "role": "CUSTOMER"
  }'
```

### 2. Login
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

### 3. Use Protected Endpoint
```bash
# Copy the token from login response
curl -X GET http://localhost:3000/api/auth/me \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### 4. Test Role-Based Access
```bash
# This should fail with 403 for CUSTOMER role
curl -X POST http://localhost:3000/api/services \
  -H "Authorization: Bearer YOUR_CUSTOMER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "businessId": "business-uuid",
    "name": "Test Service",
    "description": "Test",
    "price": 25.99,
    "duration": 30,
    "tier": "BASIC"
  }'
```

---

## Best Practices

### 1. Environment Variables
- Always use strong, unique JWT secrets in production
- Store sensitive data in environment variables
- Use different secrets for different environments

### 2. Token Management
- Store tokens securely on the client side
- Implement token refresh if needed
- Handle token expiration gracefully

### 3. Authorization Patterns
- Use the most restrictive middleware appropriate for each route
- Implement resource ownership checks where applicable
- Always validate user permissions before database operations

### 4. Error Handling
- Don't expose sensitive information in error messages
- Use consistent error response formats
- Log authentication failures for monitoring

---

## TypeScript Types

```typescript
// User authentication types
interface JwtPayload {
  userId: string;
  email: string;
  role: UserRole;
  iat?: number;
  exp?: number;
}

interface UserForToken {
  id: string;
  email: string;
  role: UserRole;
}

// Validation types
type SignupInput = z.infer<typeof signupSchema>;
type LoginInput = z.infer<typeof loginSchema>;

// Middleware types
type AuthenticatedHandler<T extends any[]> = (
  request: NextRequest,
  user: JwtPayload,
  ...args: T
) => Promise<NextResponse>;

type OptionalAuthHandler<T extends any[]> = (
  request: NextRequest,
  user: JwtPayload | null,
  ...args: T
) => Promise<NextResponse>;
``` 