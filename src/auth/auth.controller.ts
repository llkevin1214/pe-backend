import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Patch,
  Body,
  Param,
  Query,
  HttpStatus,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiQuery,
  ApiParam,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { Partner, PartnerStatus } from '../entities/partner.entity';
import { CreatePartnerDto } from './dto/create-partner.dto';
import { UpdatePartnerDto } from './dto/update-partner.dto';
import { ChangePartnerStatusDto } from './dto/change-partner-status.dto';
import { AuthGuard } from '@nestjs/passport';

/**
 * Authentication Controller
 * Provides endpoints for partner management and API key operations
 */
@ApiTags('auth')
@ApiBearerAuth()
@UseGuards(AuthGuard('bearer'))
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  /**
   * Create a new partner
   */
  @Post('partners')
  @ApiOperation({
    summary: 'Create a new partner',
    description: 'Create a new partner with API key generation',
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Partner created successfully',
    type: Partner,
  })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: 'Partner with this email already exists',
  })
  async createPartner(
    @Body() createPartnerDto: CreatePartnerDto,
  ): Promise<Partner> {
    return await this.authService.createPartner(createPartnerDto);
  }

  /**
   * Get all partners with pagination
   */
  @Get('partners')
  @ApiOperation({
    summary: 'Get all partners',
    description:
      'Get paginated list of all partners with optional status filter',
  })
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    description: 'Page number (1-based)',
    example: 1,
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Number of items per page',
    example: 10,
  })
  @ApiQuery({
    name: 'status',
    required: false,
    enum: PartnerStatus,
    description: 'Filter by partner status',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'List of partners retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        partners: {
          type: 'array',
          items: { $ref: '#/components/schemas/Partner' },
        },
        total: { type: 'number' },
        page: { type: 'number' },
        limit: { type: 'number' },
      },
    },
  })
  async getAllPartners(
    @Query('page', new ParseIntPipe({ optional: true })) page: number = 1,
    @Query('limit', new ParseIntPipe({ optional: true })) limit: number = 10,
    @Query('status') status?: PartnerStatus,
  ) {
    return await this.authService.getAllPartners(page, limit, status);
  }

  /**
   * Get partner statistics
   */
  @Get('partners/statistics')
  @ApiOperation({
    summary: 'Get partner statistics',
    description: 'Get overall statistics about partners and chargers',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Partner statistics retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        total: { type: 'number', description: 'Total number of partners' },
        active: { type: 'number', description: 'Number of active partners' },
        inactive: {
          type: 'number',
          description: 'Number of inactive partners',
        },
        suspended: {
          type: 'number',
          description: 'Number of suspended partners',
        },
        totalChargers: {
          type: 'number',
          description: 'Total number of chargers',
        },
      },
    },
  })
  async getPartnerStatistics() {
    return await this.authService.getPartnerStatistics();
  }

  /**
   * Get partner by ID
   */
  @Get('partners/:id')
  @ApiOperation({
    summary: 'Get partner by ID',
    description: 'Get detailed information about a specific partner',
  })
  @ApiParam({
    name: 'id',
    description: 'Partner ID',
    example: 1,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Partner information retrieved successfully',
    type: Partner,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Partner not found',
  })
  async getPartnerById(
    @Param('id', new ParseIntPipe()) id: number,
  ): Promise<Partner> {
    return await this.authService.getPartnerById(id);
  }

  /**
   * Update partner
   */
  @Put('partners/:id')
  @ApiOperation({
    summary: 'Update partner information',
    description:
      'Update partner details (name, email, description, maxChargers, settings)',
  })
  @ApiParam({
    name: 'id',
    description: 'Partner ID',
    example: 1,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Partner updated successfully',
    type: Partner,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Partner not found',
  })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: 'Partner with this email already exists',
  })
  async updatePartner(
    @Param('id', new ParseIntPipe()) id: number,
    @Body() updatePartnerDto: UpdatePartnerDto,
  ): Promise<Partner> {
    return await this.authService.updatePartner(id, updatePartnerDto);
  }

  /**
   * Delete partner
   */
  @Delete('partners/:id')
  @ApiOperation({
    summary: 'Delete partner',
    description: 'Delete a partner (only if they have no active chargers)',
  })
  @ApiParam({
    name: 'id',
    description: 'Partner ID',
    example: 1,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Partner deleted successfully',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        message: { type: 'string' },
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Partner not found',
  })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: 'Cannot delete partner with active chargers',
  })
  async deletePartner(
    @Param('id', new ParseIntPipe()) id: number,
  ): Promise<{ success: boolean; message: string }> {
    await this.authService.deletePartner(id);
    return { success: true, message: 'Partner deleted successfully' };
  }

  /**
   * Change partner status
   */
  @Patch('partners/:id/status')
  @ApiOperation({
    summary: 'Change partner status',
    description: 'Change partner status (ACTIVE, INACTIVE, SUSPENDED)',
  })
  @ApiParam({
    name: 'id',
    description: 'Partner ID',
    example: 1,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Partner status changed successfully',
    type: Partner,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Partner not found',
  })
  async changePartnerStatus(
    @Param('id', new ParseIntPipe()) id: number,
    @Body() changePartnerStatusDto: ChangePartnerStatusDto,
  ): Promise<Partner> {
    return await this.authService.changePartnerStatus(
      id,
      changePartnerStatusDto.status,
    );
  }

  /**
   * Generate new API key for partner
   */
  @Post('partners/:id/api-key')
  @ApiOperation({
    summary: 'Generate new API key for partner',
    description: 'Generate a new API key for the specified partner',
  })
  @ApiParam({
    name: 'id',
    description: 'Partner ID',
    example: 1,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'New API key generated successfully',
    schema: {
      type: 'object',
      properties: {
        apiKey: { type: 'string' },
        message: { type: 'string' },
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Partner not found',
  })
  async generateApiKey(
    @Param('id', new ParseIntPipe()) id: number,
  ): Promise<{ apiKey: string; message: string }> {
    const apiKey = await this.authService.generateApiKey(id);
    return {
      apiKey,
      message: 'New API key generated successfully',
    };
  }

  /**
   * Get partner charger count
   */
  @Patch('partners/:id/charger-count')
  @ApiOperation({
    summary: 'Get partner charger count',
    description: 'Get the current number of chargers for a partner',
  })
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'Partner ID',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Charger count retrieved successfully',
    type: Number,
  })
  async getPartnerChargerCount(
    @Param('id', new ParseIntPipe()) id: number,
  ): Promise<number> {
    return await this.authService.getPartnerChargerCount(id);
  }
}
