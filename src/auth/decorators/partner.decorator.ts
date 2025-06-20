import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Partner } from '../../entities/partner.entity';

/**
 * Partner Information Decorator
 * Extracts partner information from request object for controller method parameter injection
 *
 * @example
 * ```typescript
 * @Get(':chargerId/status')
 * async getChargerStatus(
 *   @Param('chargerId') chargerId: string,
 *   @PartnerInfo() partner: Partner,
 * ): Promise<ChargerStatusResponseDto> {
 *   return this.chargersService.getChargerStatus(partner.id, chargerId);
 * }
 * ```
 *
 * @param data - Decorator data (unused)
 * @param ctx - Execution context
 * @returns Partner object
 */
export const PartnerInfo = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): Partner => {
    const request = ctx.switchToHttp().getRequest();
    return request.partner;
  },
);
