import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-http-bearer';
import { AuthService } from '../auth.service';

/**
 * API Key Strategy
 * Validates API keys for authentication
 */
@Injectable()
export class ApiKeyStrategy extends PassportStrategy(Strategy, 'api-key') {
  constructor(private readonly authService: AuthService) {
    super();
  }

  /**
   * Validate API key
   * @param apiKey The API key to validate
   * @returns Partner information if valid
   */
  async validate(apiKey: string): Promise<any> {
    try {
      const partner = await this.authService.validateApiKey(apiKey);
      return partner;
    } catch (error) {
      throw new UnauthorizedException('Invalid API key');
    }
  }
}
