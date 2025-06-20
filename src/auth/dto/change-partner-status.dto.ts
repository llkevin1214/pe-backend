import { IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { PartnerStatus } from '../../entities/partner.entity';

/**
 * Change Partner Status DTO
 * Data transfer object for changing partner status
 */
export class ChangePartnerStatusDto {
  @ApiProperty({
    description: 'Partner status',
    enum: PartnerStatus,
    example: PartnerStatus.ACTIVE,
  })
  @IsEnum(PartnerStatus)
  status: PartnerStatus;
}
