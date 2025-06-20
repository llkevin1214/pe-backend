import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Charger, ChargerStatus } from '../entities/charger.entity';
import { Partner } from '../entities/partner.entity';
import {
  ChargerStatusDto,
  ChargerStatusResponseDto,
} from './dto/charger-status.dto';
import {
  ChargerControlDto,
  ChargerControlResponseDto,
  ChargerAction,
} from './dto/charger-control.dto';
import { Logger } from '../common/logger/logger.service';
import { CacheService } from '../common/services/cache.service';
import * as dayjs from 'dayjs';

/**
 * Charger Service
 * Responsible for charger status management, control, and query core business logic
 */
@Injectable()
export class ChargersService {
  constructor(
    @InjectRepository(Charger)
    private chargersRepository: Repository<Charger>,
    @InjectRepository(Partner)
    private partnersRepository: Repository<Partner>,
    private cacheService: CacheService,
    private logger: Logger,
  ) {}

  /**
   * Get charger status with caching
   * @param partnerId - Partner ID
   * @param chargerId - Charger ID
   * @returns Charger status response object
   * @throws {NotFoundException} Thrown when charger is not found
   */
  async getChargerStatus(
    partnerId: number,
    chargerId: string,
  ): Promise<ChargerStatusResponseDto> {
    try {
      // Try to get from cache first
      const cachedStatus = await this.cacheService.getChargerStatus(
        partnerId,
        chargerId,
      );

      console.log('cachedStatus:::', cachedStatus);

      if (cachedStatus) {
        return cachedStatus;
      }

      // Cache miss, query database
      const charger = await this.chargersRepository.findOne({
        where: { partnerId, chargerId },
        relations: ['partner'],
      });

      console.log('charger:::', charger);

      if (!charger) {
        throw new NotFoundException(`Charger ${chargerId} not found`);
      }

      const statusResponse: ChargerStatusResponseDto = {
        chargerId,
        status: charger.status,
        name: charger.name,
        location: charger.location,
        configuration: charger.configuration,
        updatedAt: charger.updatedAt,
        success: true,
      };

      // Cache the result for 30 seconds (as mentioned in README)
      await this.cacheService.setChargerStatus(
        partnerId,
        chargerId,
        statusResponse,
        30,
      );

      return statusResponse;
    } catch (error) {
      this.logger.error(
        `Failed to get charger status: ${error.message}`,
        error.stack,
        'ChargersService',
      );
      throw error;
    }
  }

  /**
   * Update charger status and invalidate cache
   * @param partnerId - Partner ID
   * @param chargerId - Charger ID
   * @param statusDto - Charger status update data
   * @returns Updated charger status response object
   * @throws {NotFoundException} Thrown when charger is not found
   */
  async updateChargerStatus(
    partnerId: number,
    chargerId: string,
    statusDto: ChargerStatusDto,
  ): Promise<ChargerStatusResponseDto> {
    try {
      const charger = await this.chargersRepository.findOne({
        where: { partnerId, chargerId },
      });

      if (!charger) {
        throw new NotFoundException(`Charger ${chargerId} not found`);
      }

      // Update charger status
      charger.status = statusDto.status;

      await this.chargersRepository.save(charger);

      // Invalidate cache
      await this.cacheService.invalidateChargerStatus(partnerId, chargerId);

      this.logger.log(
        `Charger status updated and cache invalidated: ${chargerId}`,
        'ChargersService',
      );

      return {
        chargerId,
        status: charger.status,
        success: true,
      };
    } catch (error) {
      this.logger.error(
        `Failed to update charger status: ${error.message}`,
        error.stack,
        'ChargersService',
      );
      throw error;
    }
  }

  /**
   * Control charger on/off
   * @param partnerId - Partner ID
   * @param controlDto - Charger control data
   * @returns Charger control response object
   * @throws {NotFoundException} Thrown when charger is not found
   * @throws {BadRequestException} Thrown when operation is not allowed
   */
  async controlCharger(
    partnerId: number,
    controlDto: ChargerControlDto,
  ): Promise<ChargerControlResponseDto> {
    try {
      const charger = await this.chargersRepository.findOne({
        where: { partnerId, chargerId: controlDto.chargerId },
      });

      if (!charger) {
        throw new NotFoundException(
          `Charger ${controlDto.chargerId} not found`,
        );
      }

      // Check if charger status allows the operation
      if (!this.isChargerActionAllowed(charger.status, controlDto.action)) {
        throw new BadRequestException(
          `Charger current status ${charger.status} does not allow operation ${controlDto.action}`,
        );
      }

      // Call internal API to control charger
      const success = await this.callInternalChargerAPI(controlDto);

      if (success) {
        // Update charger status
        const newStatus = this.getNewStatusAfterAction(controlDto.action);
        charger.status = newStatus;
        await this.chargersRepository.save(charger);

        // Invalidate cache after status change
        await this.cacheService.invalidateChargerStatus(
          partnerId,
          controlDto.chargerId,
        );

        this.logger.log(
          `Charger control successful: ${controlDto.chargerId} - ${controlDto.action}`,
          'ChargersService',
        );
      }

      return {
        chargerId: controlDto.chargerId,
        action: controlDto.action,
        success,
        timestamp: dayjs().toISOString(),
      };
    } catch (error) {
      this.logger.error(
        `Charger control failed: ${error.message}`,
        error.stack,
        'ChargersService',
      );
      return {
        chargerId: controlDto.chargerId,
        action: controlDto.action,
        success: false,
        error: error.message,
        timestamp: dayjs().toISOString(),
      };
    }
  }

  /**
   * Check if charger current status allows the specified operation
   * @param currentStatus - Charger current status
   * @param action - Operation to perform
   * @returns Whether the operation is allowed
   */
  private isChargerActionAllowed(
    currentStatus: ChargerStatus,
    action: ChargerAction,
  ): boolean {
    const allowedActions = {
      [ChargerStatus.AVAILABLE]: [
        ChargerAction.TURN_ON,
        ChargerAction.TURN_OFF,
      ],
      [ChargerStatus.CHARGING]: [ChargerAction.TURN_OFF],
      [ChargerStatus.BLOCKED]: [ChargerAction.TURN_OFF],
      [ChargerStatus.RESERVED]: [ChargerAction.TURN_ON],
      [ChargerStatus.INOPERATIVE]: [],
      [ChargerStatus.REMOVED]: [],
      [ChargerStatus.UNKNOWN]: [ChargerAction.TURN_ON, ChargerAction.TURN_OFF],
    };

    return allowedActions[currentStatus]?.includes(action) || false;
  }

  /**
   * Get new charger status after performing an action
   * @param action - Action performed
   * @returns New charger status
   */
  private getNewStatusAfterAction(action: ChargerAction): ChargerStatus {
    switch (action) {
      case ChargerAction.TURN_ON:
        return ChargerStatus.CHARGING;
      case ChargerAction.TURN_OFF:
        return ChargerStatus.AVAILABLE;
      default:
        return ChargerStatus.UNKNOWN;
    }
  }

  /**
   * Call internal charger control API
   * @param controlDto - Charger control data
   * @returns Whether the operation was successful
   */
  private async callInternalChargerAPI(
    controlDto: ChargerControlDto,
  ): Promise<boolean> {
    // This should call ABC's internal API
    // Simulating API call
    try {
      console.log('callInternalChargerAPI', controlDto);
      // Simulate network delay
      await new Promise((resolve) => setTimeout(resolve, 100));

      // Simulate 95% success rate
      return Math.random() > 0.05;
    } catch (error) {
      this.logger.error(
        `Internal API call failed: ${error.message}`,
        error.stack,
        'ChargersService',
      );
      return false;
    }
  }

  /**
   * Get charger status by chargerId only (for admin/bearer auth)
   * @param chargerId - Charger ID
   * @returns Charger status response object
   * @throws {NotFoundException} Thrown when charger is not found
   */
  async getChargerStatusByChargerId(
    chargerId: string,
  ): Promise<ChargerStatusResponseDto> {
    try {
      // Query by chargerId only, no cache
      const charger = await this.chargersRepository.findOne({
        where: { chargerId },
        relations: ['partner'],
      });
      if (!charger) {
        throw new NotFoundException(`Charger ${chargerId} not found`);
      }
      return {
        chargerId,
        status: charger.status,
        name: charger.name,
        location: charger.location,
        configuration: charger.configuration,
        updatedAt: charger.updatedAt,
        success: true,
      };
    } catch (error) {
      this.logger.error(
        `Failed to get charger status (by chargerId): ${error.message}`,
        error.stack,
        'ChargersService',
      );
      throw error;
    }
  }

  /**
   * Get status for multiple chargers (optionally filtered by partnerId)
   * @param partnerId - Partner ID (optional)
   * @returns Array of charger status response objects
   */
  async getBatchChargerStatus(
    partnerId?: number,
  ): Promise<ChargerStatusResponseDto[]> {
    let chargers: Charger[];
    if (partnerId) {
      chargers = await this.chargersRepository.find({ where: { partnerId } });
    } else {
      chargers = await this.chargersRepository.find();
    }
    return chargers.map((charger) => ({
      chargerId: charger.chargerId,
      status: charger.status,
      name: charger.name,
      location: charger.location,
      configuration: charger.configuration,
      updatedAt: charger.updatedAt,
      success: true,
    }));
  }
}
