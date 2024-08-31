import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { PrismaService } from '../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { AuthDto } from './dto';
import * as bcrypt from 'bcrypt';
import { BadRequestException, UnauthorizedException } from '@nestjs/common';
import { Response } from 'express';

describe('AuthService', () => {
  let service: AuthService;
  let prismaService: PrismaService;
  let jwtService: JwtService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: PrismaService,
          useValue: {
            user: {
              findUnique: jest.fn(),
              create: jest.fn(),
            },
            account: {
              create: jest.fn(),
            },
            refreshToken: {
              findFirst: jest.fn(),
              delete: jest.fn(),
              upsert: jest.fn(),
            },
          },
        },
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn(() => 'access_token'),
          },
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    prismaService = module.get<PrismaService>(PrismaService);
    jwtService = module.get<JwtService>(JwtService);
  });

  describe('register', () => {
    it('should throw an error if email is already in use', async () => {
      prismaService.user.findUnique = jest
        .fn()
        .mockResolvedValue({ id: 'userId' });

      const dto: AuthDto = { email: 'test@example.com', password: 'password' };
      const response = {} as Response;

      await expect(service.register(dto, response)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should create a new user and return tokens', async () => {
      prismaService.user.findUnique = jest.fn().mockResolvedValue(null);
      prismaService.user.create = jest
        .fn()
        .mockResolvedValue({ id: 'userId', email: 'test@example.com' });
      prismaService.budget.create = jest.fn().mockResolvedValue(null);
      const response = { cookie: jest.fn() } as unknown as Response;

      const dto: AuthDto = { email: 'test@example.com', password: 'password' };
      const result = await service.register(dto, response);

      expect(prismaService.user.create).toHaveBeenCalled();
      expect(result).toEqual({ access_token: 'access_token' });
    });
  });

  describe('login', () => {
    it('should throw an error if credentials are invalid', async () => {
      prismaService.user.findUnique = jest.fn().mockResolvedValue(null);
      const dto: AuthDto = { email: 'test@example.com', password: 'password' };
      const response = {} as Response;

      await expect(service.login(dto, response)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should return tokens if credentials are valid', async () => {
      const hashedPassword = await bcrypt.hash('password', 10);
      prismaService.user.findUnique = jest.fn().mockResolvedValue({
        id: 'userId',
        email: 'test@example.com',
        password: hashedPassword,
      });
      const response = { cookie: jest.fn() } as unknown as Response;

      const dto: AuthDto = { email: 'test@example.com', password: 'password' };
      const result = await service.login(dto, response);

      expect(result).toEqual({ access_token: 'access_token' });
    });
  });

  describe('refreshTokens', () => {
    it('should throw an error if refresh token is invalid', async () => {
      prismaService.refreshToken.findFirst = jest.fn().mockResolvedValue(null);
      const response = {} as Response;

      await expect(
        service.refreshTokens('invalid_token', response),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should return new tokens if refresh token is valid', async () => {
      prismaService.refreshToken.findFirst = jest.fn().mockResolvedValue({
        id: 'tokenId',
        userId: 'userId',
        token: 'valid_token',
        expiryDate: new Date(Date.now() + 10000), // Valid date
      });
      prismaService.refreshToken.delete = jest.fn();
      const response = { cookie: jest.fn() } as unknown as Response;

      const result = await service.refreshTokens('valid_token', response);

      expect(result).toEqual({ access_token: 'access_token' });
    });
  });
});
