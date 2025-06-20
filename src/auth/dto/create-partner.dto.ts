import {
  IsString,
  IsEmail,
  IsOptional,
  IsInt,
  Min,
  Max,
  MaxLength,
  IsObject,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/**
 * Partner Settings DTO
 */
export class PartnerSettingsDto {
  @ApiPropertyOptional({
    description: 'Timezone setting',
    example: 'UTC',
  })
  @IsOptional()
  @IsString()
  timezone?: string;

  @ApiPropertyOptional({
    description: 'Language setting',
    example: 'en',
  })
  @IsOptional()
  @IsString()
  language?: string;

  @ApiPropertyOptional({
    description: 'Notification settings',
    example: { email: true, sms: false },
  })
  @IsOptional()
  @IsObject()
  notifications?: Record<string, any>;
}

/**
 * Create Partner DTO
 * Data transfer object for creating new partners
 */
export class CreatePartnerDto {
  @ApiProperty({
    description: 'Partner name',
    example: 'ABC Charging Company',
    maxLength: 100,
  })
  @IsString()
  @MaxLength(100, { message: 'Partner name must not exceed 100 characters' })
  name: string;

  @ApiProperty({
    description: 'Partner email address',
    example: 'contact@abccharging.com',
    maxLength: 255,
  })
  @IsEmail({}, { message: 'Please provide a valid email address' })
  @MaxLength(255, { message: 'Email must not exceed 255 characters' })
  email: string;

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
