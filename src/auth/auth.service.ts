import {
  Injectable,
  UnauthorizedException,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Partner, PartnerStatus } from '../entities/partner.entity';
import { Charger } from '../entities/charger.entity';
import { CreatePartnerDto } from './dto/create-partner.dto';
import { UpdatePartnerDto } from './dto/update-partner.dto';
import * as crypto from 'crypto';
import * as dayjs from 'dayjs';

/**
 * Authentication Service
 * Handles API key validation and partner authentication
 */
@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(Partner)
    private readonly partnerRepository: Repository<Partner>,
    @InjectRepository(Charger)
    private readonly chargerRepository: Repository<Charger>,
  ) {}

  /**
   * Validate API key and return partner information
   * @param apiKey API key to validate
   * @returns Partner information
   * @throws {UnauthorizedException} Thrown when API key is invalid or partner is inactive
   */
  async validateApiKey(apiKey: string): Promise<Partner> {
    const partner = await this.partnerRepository.findOne({
      where: { apiKey, status: PartnerStatus.ACTIVE },
    });

    if (!partner) {
      throw new UnauthorizedException('Invalid API key');
    }

    // Check if partner is active
    if (partner.status !== PartnerStatus.ACTIVE) {
      throw new UnauthorizedException('Partner account is inactive');
    }

    // Check if partner has exceeded their charger limit
    const chargerCount = await this.getPartnerChargerCount(partner.id);
    if (chargerCount > partner.maxChargers) {
      throw new UnauthorizedException('Partner has exceeded charger limit');
    }

    return partner;
  }

  /**
   * Get the number of chargers for a partner
   * @param partnerId Partner ID
   * @returns Number of chargers
   */
  async getPartnerChargerCount(partnerId: number): Promise<number> {
    return await this.chargerRepository.count({
      where: { partnerId },
    });
  }

  /**
   * Generate a new API key for a partner
   * @param partnerId Partner ID
   * @returns Generated API key
   */
  async generateApiKey(partnerId: number): Promise<string> {
    const partner = await this.partnerRepository.findOne({
      where: { id: partnerId },
    });

    if (!partner) {
      throw new NotFoundException('Partner not found');
    }

    // Generate a secure API key
    const apiKey = this.generateSecureApiKey();

    // Update partner with new API key
    partner.apiKey = apiKey;
    partner.updatedAt = dayjs().toDate();

    await this.partnerRepository.save(partner);

    return apiKey;
  }

  /**
   * Create a new partner
   * @param createPartnerDto Partner creation data
   * @returns Created partner
   */
  async createPartner(createPartnerDto: CreatePartnerDto): Promise<Partner> {
    // Check if email already exists
    const existingPartner = await this.partnerRepository.findOne({
      where: { email: createPartnerDto.email },
    });

    if (existingPartner) {
      throw new ConflictException('Partner with this email already exists');
    }

    const apiKey = this.generateSecureApiKey();

    const partner = this.partnerRepository.create({
      ...createPartnerDto,
      apiKey,
      status: PartnerStatus.ACTIVE,
      createdAt: dayjs().toDate(),
      updatedAt: dayjs().toDate(),
    });

    return await this.partnerRepository.save(partner);
  }

  /**
   * Update partner information
   * @param partnerId Partner ID
   * @param updatePartnerDto Data to update
   * @returns Updated partner
   */
  async updatePartner(
    partnerId: number,
    updatePartnerDto: UpdatePartnerDto,
  ): Promise<Partner> {
    const partner = await this.partnerRepository.findOne({
      where: { id: partnerId },
    });

    if (!partner) {
      throw new NotFoundException('Partner not found');
    }

    // Check if email is being updated and if it already exists
    if (updatePartnerDto.email && updatePartnerDto.email !== partner.email) {
      const existingPartner = await this.partnerRepository.findOne({
        where: { email: updatePartnerDto.email },
      });

      if (existingPartner && existingPartner.id !== partnerId) {
        throw new ConflictException('Partner with this email already exists');
      }
    }

    Object.assign(partner, {
      ...updatePartnerDto,
      updatedAt: dayjs().toDate(),
    });

    return await this.partnerRepository.save(partner);
  }

  /**
   * Delete a partner
   * @param partnerId Partner ID
   */
  async deletePartner(partnerId: number): Promise<void> {
    const partner = await this.partnerRepository.findOne({
      where: { id: partnerId },
    });

    if (!partner) {
      throw new NotFoundException('Partner not found');
    }

    // Check if partner has active chargers
    const chargerCount = await this.getPartnerChargerCount(partnerId);
    if (chargerCount > 0) {
      throw new ConflictException('Cannot delete partner with active chargers');
    }

    await this.partnerRepository.remove(partner);
  }

  /**
   * Change partner status
   * @param partnerId Partner ID
   * @param status New status
   * @returns Updated partner
   */
  async changePartnerStatus(
    partnerId: number,
    status: PartnerStatus,
  ): Promise<Partner> {
    const partner = await this.partnerRepository.findOne({
      where: { id: partnerId },
    });

    if (!partner) {
      throw new NotFoundException('Partner not found');
    }

    partner.status = status;
    partner.updatedAt = dayjs().toDate();

    return await this.partnerRepository.save(partner);
  }

  /**
   * Get partner by ID
   * @param partnerId Partner ID
   * @returns Partner information
   */
  async getPartnerById(partnerId: number): Promise<Partner> {
    const partner = await this.partnerRepository.findOne({
      where: { id: partnerId },
      relations: ['chargers'],
    });

    if (!partner) {
      throw new NotFoundException('Partner not found');
    }

    return partner;
  }

  /**
   * Get all partners with pagination
   * @param page Page number (1-based)
   * @param limit Number of items per page
   * @param status Filter by status
   * @returns Paginated list of partners
   */
  async getAllPartners(
    page: number = 1,
    limit: number = 10,
    status?: PartnerStatus,
  ): Promise<{
    partners: Partner[];
    total: number;
    page: number;
    limit: number;
  }> {
    const queryBuilder = this.partnerRepository.createQueryBuilder('partner');

    if (status) {
      queryBuilder.where('partner.status = :status', { status });
    }

    const [partners, total] = await queryBuilder
      .orderBy('partner.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return {
      partners,
      total,
      page,
      limit,
    };
  }

  /**
   * Get partner statistics
   * @returns Partner statistics
   */
  async getPartnerStatistics(): Promise<{
    total: number;
    active: number;
    inactive: number;
    suspended: number;
    totalChargers: number;
  }> {
    const [total, active, inactive, suspended] = await Promise.all([
      this.partnerRepository.count(),
      this.partnerRepository.count({ where: { status: PartnerStatus.ACTIVE } }),
      this.partnerRepository.count({
        where: { status: PartnerStatus.INACTIVE },
      }),
      this.partnerRepository.count({
        where: { status: PartnerStatus.SUSPENDED },
      }),
    ]);

    // Calculate total chargers by counting all chargers
    const totalChargers = await this.chargerRepository.count();

    return {
      total,
      active,
      inactive,
      suspended,
      totalChargers,
    };
  }

  /**
   * Generate a secure API key
   * @returns Generated API key
   */
  private generateSecureApiKey(): string {
    return crypto.randomBytes(32).toString('hex');
  }
}
