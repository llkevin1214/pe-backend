import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Partner } from '../../entities/partner.entity';
import { Charger } from '../../entities/charger.entity';

/**
 * API Key Authentication Guard
 * Responsible for validating API Keys in requests and checking partner permissions and limits
 */
@Injectable()
export class ApiKeyAuthGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    @InjectRepository(Partner)
    private partnersRepository: Repository<Partner>,
    @InjectRepository(Charger)
    private chargersRepository: Repository<Charger>,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const apiKey =
      request.headers['x-api-key'] ||
      (request.headers['authorization'] &&
      request.headers['authorization'].startsWith('Bearer ')
        ? request.headers['authorization'].slice(7)
        : undefined);

    if (!apiKey) {
      return false;
    }

    // 查找partner
    const partner = await this.partnersRepository.findOne({
      where: { apiKey },
    });
    if (!partner) {
      return false;
    }
    // 注入partner到request
    request.partner = partner;
    return true;
  }
}
