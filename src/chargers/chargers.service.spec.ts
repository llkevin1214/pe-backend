import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NotFoundException } from '@nestjs/common';
import { ChargersService } from './chargers.service';
import { Charger, ChargerStatus } from '../entities/charger.entity';
import { Partner } from '../entities/partner.entity';
import { ChargerStatusDto } from './dto/charger-status.dto';
import { ChargerControlDto, ChargerAction } from './dto/charger-control.dto';
import { Logger } from '../common/logger/logger.service';
import * as dayjs from 'dayjs';

describe('ChargersService', () => {
  let service: ChargersService;
  let chargersRepository: Repository<Charger>;

  const mockCharger: Charger = {
    id: 1,
    partnerId: 1,
    chargerId: 'CHARGER001',
    name: 'Test Charger',
    status: ChargerStatus.AVAILABLE,
    location: {
      latitude: 40.7128,
      longitude: -74.006,
      address: 'Test Address',
    },
    configuration: {
      powerRating: 7.4,
      connectorType: 'Type 2',
      voltage: 230,
      current: 32,
    },
    createdAt: dayjs().toDate(),
    updatedAt: dayjs().toDate(),
    partner: null,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ChargersService,
        {
          provide: getRepositoryToken(Charger),
          useValue: {
            findOne: jest.fn(),
            save: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(Partner),
          useValue: {
            findOne: jest.fn(),
          },
        },
        {
          provide: Logger,
          useValue: {
            log: jest.fn(),
            error: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<ChargersService>(ChargersService);
    chargersRepository = module.get<Repository<Charger>>(
      getRepositoryToken(Charger),
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getChargerStatus', () => {
    it('should return charger status successfully', async () => {
      const partnerId = 1;
      const chargerId = 'CHARGER001';

      jest.spyOn(chargersRepository, 'findOne').mockResolvedValue(mockCharger);

      const result = await service.getChargerStatus(partnerId, chargerId);

      expect(result).toMatchObject({
        chargerId: 'CHARGER001',
        status: ChargerStatus.AVAILABLE,
        success: true,
      });
      expect(chargersRepository.findOne).toHaveBeenCalledWith({
        where: { partnerId, chargerId },
        relations: ['partner'],
      });
    });

    it('should throw NotFoundException when charger not found', async () => {
      const partnerId = 1;
      const chargerId = 'NONEXISTENT';

      jest.spyOn(chargersRepository, 'findOne').mockResolvedValue(null);

      await expect(
        service.getChargerStatus(partnerId, chargerId),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('updateChargerStatus', () => {
    it('should update charger status successfully', async () => {
      const partnerId = 1;
      const chargerId = 'CHARGER001';
      const statusDto: ChargerStatusDto = {
        status: ChargerStatus.CHARGING,
      };

      const updatedCharger = {
        ...mockCharger,
        status: ChargerStatus.CHARGING,
      };
      jest.spyOn(chargersRepository, 'findOne').mockResolvedValue(mockCharger);
      jest.spyOn(chargersRepository, 'save').mockResolvedValue(updatedCharger);

      const result = await service.updateChargerStatus(
        partnerId,
        chargerId,
        statusDto,
      );

      expect(result).toMatchObject({
        chargerId: 'CHARGER001',
        status: ChargerStatus.CHARGING,
        success: true,
      });
      expect(chargersRepository.save).toHaveBeenCalled();
    });

    it('should throw NotFoundException when charger not found', async () => {
      const partnerId = 1;
      const chargerId = 'NONEXISTENT';
      const statusDto: ChargerStatusDto = {
        status: ChargerStatus.CHARGING,
      };

      jest.spyOn(chargersRepository, 'findOne').mockResolvedValue(null);

      await expect(
        service.updateChargerStatus(partnerId, chargerId, statusDto),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('controlCharger', () => {
    it('should control charger successfully when action is allowed', async () => {
      const partnerId = 1;
      const controlDto: ChargerControlDto = {
        chargerId: 'CHARGER001',
        action: ChargerAction.TURN_ON,
      };

      jest.spyOn(chargersRepository, 'findOne').mockResolvedValue(mockCharger);
      jest.spyOn(chargersRepository, 'save').mockResolvedValue(mockCharger);

      const result = await service.controlCharger(partnerId, controlDto);

      expect(result.chargerId).toBe('CHARGER001');
      expect(result.action).toBe(ChargerAction.TURN_ON);
      expect(result.success).toBeDefined();
      expect(result.timestamp).toBeDefined();
    });

    it('should return error when action is not allowed', async () => {
      const partnerId = 1;
      const controlDto: ChargerControlDto = {
        chargerId: 'CHARGER001',
        action: ChargerAction.TURN_ON,
      };

      const inoperativeCharger = {
        ...mockCharger,
        status: ChargerStatus.INOPERATIVE,
      };
      jest
        .spyOn(chargersRepository, 'findOne')
        .mockResolvedValue(inoperativeCharger);

      const result = await service.controlCharger(partnerId, controlDto);

      expect(result.success).toBe(false);
      expect(result.error).toContain(
        'Charger current status INOPERATIVE does not allow operation',
      );
    });

    it('should return error when charger not found', async () => {
      const partnerId = 1;
      const controlDto: ChargerControlDto = {
        chargerId: 'NONEXISTENT',
        action: ChargerAction.TURN_ON,
      };

      jest.spyOn(chargersRepository, 'findOne').mockResolvedValue(null);

      const result = await service.controlCharger(partnerId, controlDto);

      expect(result.success).toBe(false);
      expect(result.error).toContain('Charger NONEXISTENT not found');
    });
  });

  describe('isChargerActionAllowed', () => {
    it('should return true for allowed actions', () => {
      // Test AVAILABLE status with TURN_ON action
      const result1 = (service as any).isChargerActionAllowed(
        ChargerStatus.AVAILABLE,
        ChargerAction.TURN_ON,
      );
      expect(result1).toBe(true);

      // Test CHARGING status with TURN_OFF action
      const result2 = (service as any).isChargerActionAllowed(
        ChargerStatus.CHARGING,
        ChargerAction.TURN_OFF,
      );
      expect(result2).toBe(true);
    });

    it('should return false for disallowed actions', () => {
      // Test INOPERATIVE status with TURN_ON action
      const result1 = (service as any).isChargerActionAllowed(
        ChargerStatus.INOPERATIVE,
        ChargerAction.TURN_ON,
      );
      expect(result1).toBe(false);

      // Test CHARGING status with TURN_ON action
      const result2 = (service as any).isChargerActionAllowed(
        ChargerStatus.CHARGING,
        ChargerAction.TURN_ON,
      );
      expect(result2).toBe(false);
    });
  });

  describe('getNewStatusAfterAction', () => {
    it('should return correct status after TURN_ON action', () => {
      const result = (service as any).getNewStatusAfterAction(
        ChargerAction.TURN_ON,
      );
      expect(result).toBe(ChargerStatus.CHARGING);
    });

    it('should return correct status after TURN_OFF action', () => {
      const result = (service as any).getNewStatusAfterAction(
        ChargerAction.TURN_OFF,
      );
      expect(result).toBe(ChargerStatus.AVAILABLE);
    });

    it('should return UNKNOWN for unknown action', () => {
      const result = (service as any).getNewStatusAfterAction('UNKNOWN_ACTION');
      expect(result).toBe(ChargerStatus.UNKNOWN);
    });
  });
});
