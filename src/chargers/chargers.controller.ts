import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Param,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiSecurity,
} from '@nestjs/swagger';
import { ChargersService } from './chargers.service';
import {
  ChargerStatusDto,
  ChargerStatusResponseDto,
} from './dto/charger-status.dto';
import {
  ChargerControlDto,
  ChargerControlResponseDto,
} from './dto/charger-control.dto';
import { UnionAuthGuard } from '../common/guards/union-auth.guard';
import { PartnerInfo } from '../auth/decorators/partner.decorator';

/**
 * Charger Controller
 * Provides REST API interfaces for charger status query, update, and control
 */
@ApiTags('chargers')
@Controller('chargers')
@UseGuards(UnionAuthGuard)
@ApiSecurity('api-key')
@ApiSecurity('bearer')
export class ChargersController {
  constructor(private readonly chargersService: ChargersService) {}

  /**
   * Get status information for a specific charger
   * @param chargerId - Charger ID
   * @param partner - Partner information (parsed from API Key)
   * @returns Charger status response
   */
  @Get(':chargerId/status')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get charger status' })
  @ApiParam({ name: 'chargerId', description: 'Charger ID' })
  @ApiResponse({
    status: 200,
    description: 'Successfully retrieved charger status',
    type: ChargerStatusResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Charger not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getChargerStatus(
    @Param('chargerId') chargerId: string,
    @PartnerInfo() partner: any,
  ): Promise<ChargerStatusResponseDto> {
    if (partner && partner.id) {
      // API Key authentication: must use partnerId + chargerId
      return this.chargersService.getChargerStatus(partner.id, chargerId);
    } else {
      // Bearer authentication: only chargerId is required
      return this.chargersService.getChargerStatusByChargerId(chargerId);
    }
  }

  /**
   * Update status information for a specific charger
   * @param chargerId - Charger ID
   * @param statusDto - Status update data
   * @param partner - Partner information (parsed from API Key)
   * @returns Updated charger status response
   */
  @Put(':chargerId/status')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Update charger status' })
  @ApiParam({ name: 'chargerId', description: 'Charger ID' })
  @ApiResponse({
    status: 200,
    description: 'Successfully updated charger status',
    type: ChargerStatusResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 404, description: 'Charger not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async updateChargerStatus(
    @Param('chargerId') chargerId: string,
    @Body() statusDto: ChargerStatusDto,
    @PartnerInfo() partner: any,
  ): Promise<ChargerStatusResponseDto> {
    return this.chargersService.updateChargerStatus(
      partner.id,
      chargerId,
      statusDto,
    );
  }

  /**
   * Control charger on/off operation
   * @param chargerId - Charger ID
   * @param controlDto - Control operation data
   * @param partner - Partner information (parsed from API Key)
   * @returns Control operation response
   */
  @Post(':chargerId/control')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Control charger on/off' })
  @ApiParam({ name: 'chargerId', description: 'Charger ID' })
  @ApiResponse({
    status: 200,
    description: 'Successfully controlled charger',
    type: ChargerControlResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request or operation not allowed',
  })
  @ApiResponse({ status: 404, description: 'Charger not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async controlCharger(
    @Param('chargerId') chargerId: string,
    @Body() controlDto: ChargerControlDto,
    @PartnerInfo() partner: any,
  ): Promise<ChargerControlResponseDto> {
    // Ensure chargerId in URL parameter matches the one in request body
    controlDto.chargerId = chargerId;
    return this.chargersService.controlCharger(partner.id, controlDto);
  }

  /**
   * Get batch charger status information
   * @param partner - Partner information (parsed from API Key)
   * @returns Batch charger status response
   */
  @Get('batch/status')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get batch charger status' })
  @ApiResponse({
    status: 200,
    description: 'Successfully retrieved batch charger status',
    schema: {
      type: 'object',
      properties: {
        chargers: {
          type: 'array',
          items: { $ref: '#/components/schemas/ChargerStatusResponseDto' },
        },
        total: { type: 'number' },
        success: { type: 'boolean' },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getBatchChargerStatus(@PartnerInfo() partner: any): Promise<{
    chargers: ChargerStatusResponseDto[];
    total: number;
    success: boolean;
  }> {
    let chargers: ChargerStatusResponseDto[];
    if (partner && partner.id) {
      // Partner: only return chargers for this partner
      chargers = await this.chargersService.getBatchChargerStatus(partner.id);
    } else {
      // Admin: return all chargers
      chargers = await this.chargersService.getBatchChargerStatus();
    }
    return {
      chargers,
      total: chargers.length,
      success: true,
    };
  }
}
