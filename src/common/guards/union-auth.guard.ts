import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiKeyAuthGuard } from './api-key-auth.guard';

@Injectable()
export class UnionAuthGuard implements CanActivate {
  private readonly bearerGuard = new (AuthGuard('bearer'))();
  constructor(private readonly apiKeyGuard: ApiKeyAuthGuard) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // Try API Key Guard first
    try {
      if (await this.apiKeyGuard.canActivate(context)) {
        return true;
      }
    } catch (e) {
      // Ignore and try next
    }
    // Try Bearer Guard
    try {
      if (await this.bearerGuard.canActivate(context)) {
        return true;
      }
    } catch (e) {
      // Ignore
    }
    throw new UnauthorizedException('Invalid API key or Bearer token');
  }
}
