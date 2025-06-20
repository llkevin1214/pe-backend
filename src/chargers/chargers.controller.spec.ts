import { Test, TestingModule } from '@nestjs/testing';
import { ChargersController } from './chargers.controller';
import { ChargersService } from './chargers.service';
import {
  ChargerStatusDto,
  ChargerStatusResponseDto,
} from './dto/charger-status.dto';
import {
  ChargerControlDto,
  ChargerControlResponseDto,
  ChargerAction,
} from './dto/charger-control.dto';
import { ChargerStatus } from '../entities/charger.entity';
import { NotFoundException } from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Partner } from '../entities/partner.entity';
import * as dayjs from 'dayjs';

describe('ChargersController', () => {
  let controller: ChargersController;
  let service: ChargersService;

  const mockPartner = {
    id: 'partner-1',
    name: 'Test Partner',
    email: 'test@example.com',
  };

  const mockChargerStatusResponse: ChargerStatusResponseDto = {
    chargerId: 'CHARGER001',
    status: ChargerStatus.AVAILABLE,
    success: true,
  };

  const mockChargerControlResponse: ChargerControlResponseDto = {
    chargerId: 'CHARGER001',
    action: ChargerAction.TURN_ON,
    success: true,
    timestamp: dayjs().toISOString(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ChargersController],
      providers: [
        {
          provide: ChargersService,
          useValue: {
            getChargerStatus: jest.fn(),
            updateChargerStatus: jest.fn(),
            controlCharger: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(Partner),
          useValue: {
            findOne: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<ChargersController>(ChargersController);
    service = module.get<ChargersService>(ChargersService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getChargerStatus', () => {
    it('should return charger status successfully', async () => {
      const chargerId = 'CHARGER001';

      jest
        .spyOn(service, 'getChargerStatus')
        .mockResolvedValue(mockChargerStatusResponse);

      const result = await controller.getChargerStatus(chargerId, mockPartner);

      expect(result).toEqual(mockChargerStatusResponse);
      expect(service.getChargerStatus).toHaveBeenCalledWith(
        mockPartner.id,
        chargerId,
      );
    });

    it('should throw NotFoundException when charger not found', async () => {
      const chargerId = 'NONEXISTENT';

      jest
        .spyOn(service, 'getChargerStatus')
        .mockRejectedValue(new NotFoundException());

      await expect(
        controller.getChargerStatus(chargerId, mockPartner),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('updateChargerStatus', () => {
    it('should update charger status successfully', async () => {
      const chargerId = 'CHARGER001';
      const statusDto: ChargerStatusDto = {
        status: ChargerStatus.CHARGING,
      };

      jest
        .spyOn(service, 'updateChargerStatus')
        .mockResolvedValue(mockChargerStatusResponse);

      const result = await controller.updateChargerStatus(
        chargerId,
        statusDto,
        mockPartner,
      );

      expect(result).toEqual(mockChargerStatusResponse);
      expect(service.updateChargerStatus).toHaveBeenCalledWith(
        mockPartner.id,
        chargerId,
        statusDto,
      );
    });

    it('should throw NotFoundException when charger not found', async () => {
      const chargerId = 'NONEXISTENT';
      const statusDto: ChargerStatusDto = {
        status: ChargerStatus.CHARGING,
      };

      jest
        .spyOn(service, 'updateChargerStatus')
        .mockRejectedValue(new NotFoundException());

      await expect(
        controller.updateChargerStatus(chargerId, statusDto, mockPartner),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('controlCharger', () => {
    it('should control charger successfully', async () => {
      const chargerId = 'CHARGER001';
      const controlDto: ChargerControlDto = {
        chargerId: 'CHARGER001',
        action: ChargerAction.TURN_ON,
      };

      jest
        .spyOn(service, 'controlCharger')
        .mockResolvedValue(mockChargerControlResponse);

      const result = await controller.controlCharger(
        chargerId,
        controlDto,
        mockPartner,
      );

      expect(result).toEqual(mockChargerControlResponse);
      expect(service.controlCharger).toHaveBeenCalledWith(mockPartner.id, {
        ...controlDto,
        chargerId,
      });
    });

    it('should handle control failure gracefully', async () => {
      const chargerId = 'CHARGER001';
      const controlDto: ChargerControlDto = {
        chargerId: 'CHARGER001',
        action: ChargerAction.TURN_ON,
      };

      const failedResponse: ChargerControlResponseDto = {
        chargerId: 'CHARGER001',
        action: ChargerAction.TURN_ON,
        success: false,
        error: 'Operation failed',
        timestamp: dayjs().toISOString(),
      };

      jest.spyOn(service, 'controlCharger').mockResolvedValue(failedResponse);

      const result = await controller.controlCharger(
        chargerId,
        controlDto,
        mockPartner,
      );

      expect(result.success).toBe(false);
      expect(result.error).toBe('Operation failed');
    });
  });

  describe('getBatchChargerStatus', () => {
    it('should return batch charger status', async () => {
      const result = await controller.getBatchChargerStatus(mockPartner);

      expect(result).toEqual({
        chargers: [],
        total: 0,
        success: true,
      });
    });
  });
});
