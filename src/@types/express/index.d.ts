import 'express';

declare module 'express' {
  interface Request {
    user?: {
      sub: number;
      role: string;
      // Add more fields if needed
    };
  }
}
