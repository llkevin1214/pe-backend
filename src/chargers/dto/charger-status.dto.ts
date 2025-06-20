import { IsEnum, IsOptional, IsString, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ChargerStatus } from '../../entities/charger.entity';

/**
 * Charger Status Update Request DTO
 * Used for updating charger status information
 */
export class ChargerStatusDto {
  /**
   * Charger status
   */
  @ApiProperty({
    description: 'Charger status',
    enum: ChargerStatus,
    example: ChargerStatus.AVAILABLE,
  })
  @IsEnum(ChargerStatus, { message: 'Invalid charger status' })
  status: ChargerStatus;

  @ApiPropertyOptional({
    description: 'Charger ID',
    maxLength: 100,
  })
  @IsOptional()
  @IsString({ message: 'Charger ID must be a string' })
  @MaxLength(100, { message: 'Charger ID must not exceed 100 characters' })
  chargerId?: string;
}

/**
 * Charger Status Response DTO
 * Returns current charger status information
 */
export class ChargerStatusResponseDto {
  /**
   * Charger ID
   */
  @ApiProperty({
    description: 'Charger ID',
    example: 'CHARGER_001',
  })
  chargerId: string;

  /**
   * Charger status
   */
  @ApiProperty({
    description: 'Charger status',
    enum: ChargerStatus,
    example: ChargerStatus.AVAILABLE,
  })
  status: ChargerStatus;

  /**
   * Operation success status
   */
  @ApiProperty({
    description: 'Operation success status',
    example: true,
  })
  success: boolean;

  @ApiPropertyOptional({ description: 'Error message' })
  error?: string;

  @ApiPropertyOptional({ description: 'Charger name' })
  name?: string;

  @ApiPropertyOptional({ description: 'Charger location info' })
  location?: any;

  @ApiPropertyOptional({ description: 'Charger configuration info' })
  configuration?: any;

  @ApiPropertyOptional({
    description: 'Last update time',
    type: String,
    format: 'date-time',
  })
  updatedAt?: Date;
}
