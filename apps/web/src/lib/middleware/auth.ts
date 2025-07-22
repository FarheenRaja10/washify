import { NextRequest, NextResponse } from 'next/server';
import { verifyToken, extractTokenFromHeader, JwtPayload } from '../jwt';
import { UserRole } from '@washify/db';

export interface AuthenticatedRequest extends NextRequest {
  user: JwtPayload;
}

/**
 * Authentication middleware that verifies JWT tokens
 * @param request - Next.js request object
 * @returns Object with user payload and error information
 */
export function authenticateToken(request: NextRequest): {
  user: JwtPayload | null;
  error: string | null;
} {
  try {
    const authHeader = request.headers.get('authorization');
    const token = extractTokenFromHeader(authHeader);

    if (!token) {
      return {
        user: null,
        error: 'Authorization token required',
      };
    }

    const user = verifyToken(token);
    return {
      user,
      error: null,
    };
  } catch (error) {
    return {
      user: null,
      error: error instanceof Error ? error.message : 'Authentication failed',
    };
  }
}

/**
 * Higher-order function that requires authentication for a route handler
 * @param handler - Route handler function
 * @returns Wrapped handler with authentication
 */
export function requireAuth<T extends any[]>(
  handler: (request: NextRequest, user: JwtPayload, ...args: T) => Promise<NextResponse>
) {
  return async (request: NextRequest, ...args: T): Promise<NextResponse> => {
    const { user, error } = authenticateToken(request);

    if (error || !user) {
      return NextResponse.json(
        { error: error || 'Authentication required' },
        { status: 401 }
      );
    }

    return handler(request, user, ...args);
  };
}

/**
 * Higher-order function that requires specific roles for a route handler
 * @param roles - Array of allowed roles
 * @param handler - Route handler function
 * @returns Wrapped handler with role-based authorization
 */
export function requireRoles<T extends any[]>(
  roles: UserRole[],
  handler: (request: NextRequest, user: JwtPayload, ...args: T) => Promise<NextResponse>
) {
  return requireAuth<T>(async (request: NextRequest, user: JwtPayload, ...args: T) => {
    if (!roles.includes(user.role)) {
      return NextResponse.json(
        { error: `Access denied. Required roles: ${roles.join(', ')}` },
        { status: 403 }
      );
    }

    return handler(request, user, ...args);
  });
}

/**
 * Middleware specifically for ADMIN role
 */
export function requireAdmin<T extends any[]>(
  handler: (request: NextRequest, user: JwtPayload, ...args: T) => Promise<NextResponse>
) {
  return requireRoles(['ADMIN'], handler);
}

/**
 * Middleware for OPERATOR or ADMIN roles
 */
export function requireOperator<T extends any[]>(
  handler: (request: NextRequest, user: JwtPayload, ...args: T) => Promise<NextResponse>
) {
  return requireRoles(['OPERATOR', 'ADMIN'], handler);
}

/**
 * Middleware that allows any authenticated user
 */
export function requireUser<T extends any[]>(
  handler: (request: NextRequest, user: JwtPayload, ...args: T) => Promise<NextResponse>
) {
  return requireRoles(['CUSTOMER', 'OPERATOR', 'ADMIN'], handler);
}

/**
 * Optional authentication - provides user if token exists but doesn't require it
 * @param handler - Route handler function
 * @returns Wrapped handler with optional authentication
 */
export function optionalAuth<T extends any[]>(
  handler: (request: NextRequest, user: JwtPayload | null, ...args: T) => Promise<NextResponse>
) {
  return async (request: NextRequest, ...args: T): Promise<NextResponse> => {
    const { user } = authenticateToken(request);
    return handler(request, user, ...args);
  };
} 