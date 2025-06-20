import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';

/**
 * JWT Strategy
 * Validates Bearer tokens (JWT) for admin authentication
 */
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'bearer') {
  constructor(configService: ConfigService) {
    const secret = configService.get('JWT_SECRET', 'peSystem');
    if (!secret) {
      throw new Error('JWT_SECRET is not set in environment variables');
    }
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: secret,
    });
  }

  /**
   * Validate JWT payload
   * @param payload JWT payload
   * @returns user info if valid
   */
  async validate(payload: any): Promise<any> {
    if (!payload || !payload.userId || !payload.role) {
      throw new UnauthorizedException('Invalid JWT payload');
    }
    // You can query the database here if needed, or just return the payload
    return { userId: payload.userId, role: payload.role };
  }
}
