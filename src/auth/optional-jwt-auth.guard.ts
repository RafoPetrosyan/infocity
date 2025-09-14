import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';

@Injectable()
export class OptionalJwtAuthGuard implements CanActivate {
  constructor(private jwtService: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest<Request>();
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return true;
    }

    const token = authHeader.split(' ')[1];
    try {
      const decoded = await this.jwtService.verifyAsync(token);
      req['user'] = decoded;
      return true;
    } catch (err) {
      throw new ForbiddenException('Access token invalid or expired');
    }
  }
}
