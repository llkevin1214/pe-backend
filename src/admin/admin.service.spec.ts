import { Test, TestingModule } from '@nestjs/testing';
import { AdminService } from './admin.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { AdminUser } from '../entities/admin-user.entity';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { UnauthorizedException } from '@nestjs/common';

describe('AdminService', () => {
  let service: AdminService;
  let jwtService: JwtService;
  let adminRepo: any;

  beforeEach(async () => {
    adminRepo = {
      findOne: jest.fn(),
    };
    jwtService = {
      sign: jest.fn(),
      verify: jest.fn(),
    } as any;
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AdminService,
        { provide: getRepositoryToken(AdminUser), useValue: adminRepo },
        { provide: JwtService, useValue: jwtService },
      ],
    }).compile();
    service = module.get<AdminService>(AdminService);
  });

  describe('validateUser', () => {
    it('should return user if username and password are correct', async () => {
      const user = { username: 'admin', password: 'hashed' };
      adminRepo.findOne.mockResolvedValue(user);
      (jest.spyOn(bcrypt, 'compare') as any).mockResolvedValue(true);
      await expect(service.validateUser('admin', 'password')).resolves.toEqual(
        user,
      );
    });
    it('should throw if user not found', async () => {
      adminRepo.findOne.mockResolvedValue(undefined);
      await expect(service.validateUser('admin', 'password')).rejects.toThrow(
        UnauthorizedException,
      );
    });
    it('should throw if password not match', async () => {
      const user = { username: 'admin', password: 'hashed' };
      adminRepo.findOne.mockResolvedValue(user);
      (jest.spyOn(bcrypt, 'compare') as any).mockResolvedValue(false);
      await expect(service.validateUser('admin', 'password')).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });

  describe('login', () => {
    it('should return token and refreshToken', async () => {
      const user = { id: 1, username: 'admin', role: 'admin' } as AdminUser;
      (jwtService.sign as jest.Mock)
        .mockReturnValueOnce('token')
        .mockReturnValueOnce('refreshToken');
      const result = await service.login(user);
      expect(result).toEqual({ token: 'token', refreshToken: 'refreshToken' });
      expect(jwtService.sign).toHaveBeenCalledTimes(2);
    });
  });

  describe('refreshToken', () => {
    it('should return new token and refreshToken if refreshToken is valid', async () => {
      const payload = { sub: 1, username: 'admin', role: 'admin' };
      (jwtService.verify as jest.Mock).mockReturnValue(payload);
      (jwtService.sign as jest.Mock)
        .mockReturnValueOnce('newToken')
        .mockReturnValueOnce('newRefreshToken');
      const result = await service.refreshToken('refreshToken');
      expect(result).toEqual({
        token: 'newToken',
        refreshToken: 'newRefreshToken',
      });
    });
    it('should throw if refreshToken is invalid', async () => {
      (jwtService.verify as jest.Mock).mockImplementation(() => {
        throw new Error();
      });
      await expect(service.refreshToken('bad')).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });
}); 