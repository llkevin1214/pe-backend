import { IsString, MinLength, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AdminLoginDto {
  @ApiProperty({ example: 'admin', description: 'Username' })
  @IsString()
  @MinLength(3)
  @MaxLength(50)
  username: string;

  @ApiProperty({ example: 'ABcd1234!', description: 'Password' })
  @IsString()
  @MinLength(6)
  @MaxLength(100)
  password: string;
}

export class AdminLoginResponseDto {
  @ApiProperty({ description: 'JWT Token' })
  token: string;

  @ApiProperty({ description: 'JWT Refresh Token' })
  refreshToken: string;
}
