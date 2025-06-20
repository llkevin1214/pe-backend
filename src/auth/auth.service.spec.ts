import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuthService } from './auth.service';
import { Partner, PartnerStatus } from '../entities/partner.entity';
import { Charger } from '../entities/charger.entity';
import { CreatePartnerDto } from './dto/create-partner.dto';
import { UpdatePartnerDto } from './dto/update-partner.dto';
import {
  UnauthorizedException,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import * as dayjs from 'dayjs';

describe('AuthService', () => {
  let service: AuthService;

  const mockPartner: Partner = {
    id: 1,
    name: 'Test Partner',
    email: 'test@example.com',
    description: 'Test description',
    apiKey: 'test-api-key',
    status: PartnerStatus.ACTIVE,
    maxChargers: 1000,
    settings: { timezone: 'UTC' },
    createdAt: dayjs().toDate(),
    updatedAt: dayjs().toDate(),
    chargers: [],
  };

  const mockPartnerRepository = {
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    remove: jest.fn(),
    count: jest.fn(),
    createQueryBuilder: jest.fn(),
  };

  const mockChargerRepository = {
    count: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: getRepositoryToken(Partner),
          useValue: mockPartnerRepository,
        },
        {
          provide: getRepositoryToken(Charger),
          useValue: mockChargerRepository,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('validateApiKey', () => {
    it('should validate a valid API key', async () => {
      mockPartnerRepository.findOne.mockResolvedValue(mockPartner);
      mockChargerRepository.count.mockResolvedValue(5);

      const result = await service.validateApiKey('test-api-key');

      expect(result).toEqual(mockPartner);
      expect(mockPartnerRepository.findOne).toHaveBeenCalledWith({
        where: { apiKey: 'test-api-key', status: PartnerStatus.ACTIVE },
      });
      expect(mockChargerRepository.count).toHaveBeenCalledWith({
        where: { partnerId: mockPartner.id },
      });
    });

    it('should throw UnauthorizedException for invalid API key', async () => {
      mockPartnerRepository.findOne.mockResolvedValue(null);

      await expect(service.validateApiKey('invalid-key')).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should throw UnauthorizedException for inactive partner', async () => {
      const inactivePartner = {
        ...mockPartner,
        status: PartnerStatus.INACTIVE,
      };
      mockPartnerRepository.findOne.mockResolvedValue(inactivePartner);

      await expect(service.validateApiKey('test-api-key')).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should throw UnauthorizedException when partner exceeds charger limit', async () => {
      mockPartnerRepository.findOne.mockResolvedValue(mockPartner);
      mockChargerRepository.count.mockResolvedValue(1001);

      await expect(service.validateApiKey('test-api-key')).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });

  describe('createPartner', () => {
    const createPartnerDto: CreatePartnerDto = {
      name: 'New Partner',
      email: 'new@example.com',
      description: 'New partner description',
      maxChargers: 500,
    };

    it('should create a new partner successfully', async () => {
      mockPartnerRepository.findOne.mockResolvedValue(null);
      mockPartnerRepository.create.mockReturnValue(mockPartner);
      mockPartnerRepository.save.mockResolvedValue(mockPartner);

      const result = await service.createPartner(createPartnerDto);

      expect(result).toEqual(mockPartner);
      expect(mockPartnerRepository.findOne).toHaveBeenCalledWith({
        where: { email: createPartnerDto.email },
      });
      expect(mockPartnerRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          ...createPartnerDto,
          status: PartnerStatus.ACTIVE,
        }),
      );
    });
  });

  describe('deletePartner', () => {
    it('should delete partner successfully', async () => {
      mockPartnerRepository.findOne.mockResolvedValue(mockPartner);
      mockChargerRepository.count.mockResolvedValue(0);
      mockPartnerRepository.remove.mockResolvedValue(mockPartner);

      await service.deletePartner(mockPartner.id);

      expect(mockPartnerRepository.remove).toHaveBeenCalledWith(
        expect.objectContaining({ id: mockPartner.id }),
      );
    });

    it('should throw NotFoundException for non-existent partner', async () => {
      mockPartnerRepository.findOne.mockResolvedValue(null);

      await expect(service.deletePartner(9999)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw ConflictException for partner with active chargers', async () => {
      mockPartnerRepository.findOne.mockResolvedValue(mockPartner);
      mockChargerRepository.count.mockResolvedValue(5);

      await expect(service.deletePartner(mockPartner.id)).rejects.toThrow(
        ConflictException,
      );
    });
  });

  describe('updatePartner', () => {
    const updatePartnerDto: UpdatePartnerDto = {
      name: 'Updated Partner',
      email: 'updated@example.com',
    };

    beforeEach(() => {
      jest.clearAllMocks();
      mockPartnerRepository.findOne.mockReset();
    });

    it('should update partner successfully', async () => {
      mockPartnerRepository.findOne.mockImplementation((options) => {
        if (options?.where?.id) {
          return Promise.resolve(mockPartner);
        }
        if (
          options?.where?.email &&
          options.where.email === 'updated@example.com'
        ) {
          return Promise.resolve(null);
        }
        return Promise.resolve(null);
      });
      mockPartnerRepository.save.mockResolvedValue({
        ...mockPartner,
        ...updatePartnerDto,
      });

      const result = await service.updatePartner(
        mockPartner.id,
        updatePartnerDto,
      );

      expect(result).toMatchObject({
        ...mockPartner,
        ...updatePartnerDto,
        updatedAt: expect.any(Date),
      });
    });

    it('should throw NotFoundException for non-existent partner', async () => {
      mockPartnerRepository.findOne.mockResolvedValue(null);

      await expect(
        service.updatePartner(9999, updatePartnerDto),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('changePartnerStatus', () => {
    it('should change partner status successfully', async () => {
      const updatedPartner = {
        ...mockPartner,
        status: PartnerStatus.SUSPENDED,
      };
      mockPartnerRepository.findOne.mockResolvedValue(mockPartner);
      mockPartnerRepository.save.mockResolvedValue(updatedPartner);

      const result = await service.changePartnerStatus(
        mockPartner.id,
        PartnerStatus.SUSPENDED,
      );

      expect(result.status).toBe(PartnerStatus.SUSPENDED);
    });

    it('should throw NotFoundException for non-existent partner', async () => {
      mockPartnerRepository.findOne.mockResolvedValue(null);

      await expect(
        service.changePartnerStatus(9999, PartnerStatus.ACTIVE),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('getAllPartners', () => {
    it('should return paginated partners', async () => {
      const mockQueryBuilder = {
        where: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        getManyAndCount: jest.fn().mockResolvedValue([[mockPartner], 1]),
        select: jest.fn().mockReturnThis(),
        getRawOne: jest.fn(),
      };

      mockPartnerRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);

      const result = await service.getAllPartners(1, 10);

      expect(result).toEqual({
        partners: [mockPartner],
        total: 1,
        page: 1,
        limit: 10,
      });
    });

    it('should filter by status', async () => {
      const mockQueryBuilder = {
        where: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        getManyAndCount: jest.fn().mockResolvedValue([[mockPartner], 1]),
        select: jest.fn().mockReturnThis(),
        getRawOne: jest.fn(),
      };

      mockPartnerRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);

      await service.getAllPartners(1, 10, PartnerStatus.ACTIVE);

      expect(mockQueryBuilder.where).toHaveBeenCalledWith(
        'partner.status = :status',
        {
          status: PartnerStatus.ACTIVE,
        },
      );
    });
  });

  describe('getPartnerStatistics', () => {
    it('should return partner statistics', async () => {
      mockPartnerRepository.count
        .mockResolvedValueOnce(10) // total
        .mockResolvedValueOnce(8) // active
        .mockResolvedValueOnce(1) // inactive
        .mockResolvedValueOnce(1); // suspended

      mockChargerRepository.count.mockResolvedValue(150);

      const result = await service.getPartnerStatistics();

      expect(result).toEqual({
        total: 10,
        active: 8,
        inactive: 1,
        suspended: 1,
        totalChargers: 150,
      });
    });
  });

  describe('generateApiKey', () => {
    it('should generate new API key successfully', async () => {
      jest.clearAllMocks();
      const newApiKey = 'new-api-key';
      mockPartnerRepository.findOne.mockResolvedValue(mockPartner);
      mockPartnerRepository.save.mockResolvedValue({
        ...mockPartner,
        apiKey: newApiKey,
      });
      jest
        .spyOn(service as any, 'generateSecureApiKey')
        .mockReturnValue(newApiKey);

      const result = await service.generateApiKey(mockPartner.id);

      expect(result).toBe(newApiKey);
      expect(mockPartnerRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          ...mockPartner,
          apiKey: expect.any(String),
        }),
      );
    });

    it('should throw NotFoundException for non-existent partner', async () => {
      jest.clearAllMocks();
      mockPartnerRepository.findOne.mockResolvedValue(null);

      await expect(service.generateApiKey(9999)).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
