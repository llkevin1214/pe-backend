import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AdminService } from './admin.service';
import { AdminLoginDto, AdminLoginResponseDto } from './dto/login.dto';

@ApiTags('admin')
@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Admin user login' })
  @ApiResponse({ status: 200, type: AdminLoginResponseDto })
  async login(@Body() dto: AdminLoginDto): Promise<AdminLoginResponseDto> {
    const user = await this.adminService.validateUser(
      dto.username,
      dto.password,
    );
    return this.adminService.login(user);
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Refresh token' })
  @ApiResponse({ status: 200, type: AdminLoginResponseDto })
  async refresh(
    @Body('refreshToken') refreshToken: string,
  ): Promise<AdminLoginResponseDto> {
    return this.adminService.refreshToken(refreshToken);
  }
}
