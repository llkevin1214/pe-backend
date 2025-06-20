import {
  IsOptional,
  IsString,
  IsEmail,
  IsInt,
  Min,
  Max,
  MaxLength,
  IsObject,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { PartnerSettingsDto } from './create-partner.dto';

/**
 * Update Partner DTO
 * Data transfer object for updating existing partners
 */
export class UpdatePartnerDto {
  @ApiPropertyOptional({
    description: 'Partner name',
    example: 'ABC Charging Company',
    maxLength: 100,
  })
  @IsOptional()
  @IsString()
  @MaxLength(100, { message: 'Partner name must not exceed 100 characters' })
  name?: string;

  @ApiPropertyOptional({
    description: 'Partner email address',
    example: 'contact@abccharging.com',
    maxLength: 255,
  })
  @IsOptional()
  @IsEmail({}, { message: 'Please provide a valid email address' })
  @MaxLength(255, { message: 'Email must not exceed 255 characters' })
  email?: string;

  @ApiPropertyOptional({
    description: 'Partner description',
    example: 'Leading EV charging solutions provider',
    maxLength: 500,
  })
  @IsOptional()
  @IsString()
  @MaxLength(500, { message: 'Description must not exceed 500 characters' })
  description?: string;

  @ApiPropertyOptional({
    description: 'Maximum number of chargers allowed',
    example: 100000,
    minimum: 1,
    maximum: 1000000,
  })
  @IsOptional()
  @IsInt({ message: 'Max chargers must be an integer' })
  @Min(1, { message: 'Max chargers must be at least 1' })
  @Max(1000000, { message: 'Max chargers cannot exceed 1,000,000' })
  maxChargers?: number;

  @ApiPropertyOptional({
    description: 'Partner settings in JSON format',
    example: { timezone: 'UTC', language: 'en' },
    type: PartnerSettingsDto,
  })
  @IsOptional()
  @IsObject({ message: 'Settings must be an object' })
  @ValidateNested()
  @Type(() => PartnerSettingsDto)
  settings?: PartnerSettingsDto;
}
