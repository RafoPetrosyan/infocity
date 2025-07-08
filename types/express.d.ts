import 'express';

declare namespace Express {
  export interface Request {
    user?: {
      sub: number;
      role: string;
      [key: string]: any;
    };
  }
}
