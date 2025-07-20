import { UserRole } from '@washify/db';
import NextAuth from 'next-auth';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      email: string;
      name: string;
      role: UserRole;
      operatorId?: string;
    };
  }

  interface User {
    id: string;
    email: string;
    name: string;
    role: UserRole;
    operatorId?: string;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    role: UserRole;
    operatorId?: string;
  }
} 