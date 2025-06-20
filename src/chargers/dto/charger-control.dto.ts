import {
  IsEnum,
  IsString,
  IsOptional,
  IsBoolean,
  MaxLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/**
 * Charger Operation Type Enum
 */
export enum ChargerAction {
  TURN_ON = 'TURN_ON', // Turn on charger
  TURN_OFF = 'TURN_OFF', // Turn off charger
}

/**
 * Charger Control Request DTO
 * Used for controlling charger on/off operations
 */
export class ChargerControlDto {
  /**
   * Charger ID
   */
  @ApiProperty({
    description: 'Charger ID',
    example: 'CHARGER_001',
    maxLength: 100,
  })
  @IsString({ message: 'Charger ID must be a string' })
  @MaxLength(100, { message: 'Charger ID must not exceed 100 characters' })
  chargerId: string;

  /**
   * Control operation type
   */
  @ApiProperty({
    description: 'Control operation type',
    enum: ChargerAction,
    example: ChargerAction.TURN_ON,
  })
  @IsEnum(ChargerAction, { message: 'Invalid charger action' })
  action: ChargerAction;

  @ApiPropertyOptional({
    description: 'Operation reason',
    maxLength: 500,
  })
  @IsOptional()
  @IsString({ message: 'Reason must be a string' })
  @MaxLength(500, { message: 'Reason must not exceed 500 characters' })
  reason?: string;

  @ApiPropertyOptional({ description: 'Force operation flag' })
  @IsOptional()
  @IsBoolean({ message: 'Force flag must be a boolean' })
  force?: boolean;
}

/**
 * Charger Control Response DTO
 * Returns control operation results
 */
export class ChargerControlResponseDto {
  /**
   * Charger ID
   */
  @ApiProperty({
    description: 'Charger ID',
    example: 'CHARGER_001',
  })
  chargerId: string;

  /**
   * Executed action
   */
  @ApiProperty({
    description: 'Executed action',
    enum: ChargerAction,
    example: ChargerAction.TURN_ON,
  })
  action: ChargerAction;

  /**
   * Operation success status
   */
  @ApiProperty({
    description: 'Operation success status',
    example: true,
  })
  success: boolean;

  /**
   * Error message (when operation fails)
   */
  @ApiProperty({
    description: 'Error message (when operation fails)',
    required: false,
    example: 'Charger is currently in use',
  })
  @IsOptional()
  error?: string;

  /**
   * Operation timestamp
   */
  @ApiProperty({
    description: 'Operation timestamp',
    example: '2024-01-15T10:30:00Z',
  })
  timestamp: string;
}
