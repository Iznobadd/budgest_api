import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuthDto } from './dto';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { v4 as uuidv4 } from 'uuid';
import { Response } from 'express';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async register(
    dto: AuthDto,
    res: Response,
  ): Promise<{ access_token: string }> {
    const amount = parseFloat(dto.amount);

    if (isNaN(amount)) {
      throw new Error('Invalid amount');
    }

    const userExists = await this.prisma.user.findUnique({
      where: {
        email: dto.email,
      },
    });

    if (userExists) {
      throw new BadRequestException('Email already in use');
    }

    const hashedPassword = await this.hashData(dto.password);
    const newUser = await this.prisma.user.create({
      data: {
        email: dto.email,
        password: hashedPassword,
      },
    });

    await this.prisma.budget.create({
      data: {
        userId: newUser.id,
        amount,
      },
    });

    return this.generateUserTokens(newUser.id, res);
  }

  async login(dto: AuthDto, res: Response): Promise<{ access_token: string }> {
    const user = await this.prisma.user.findUnique({
      where: {
        email: dto.email,
      },
    });

    if (!user) throw new UnauthorizedException('Wrong credentials');

    const passwordMatches = await bcrypt.compare(dto.password, user.password);
    if (!passwordMatches) throw new UnauthorizedException('Wrong credentials');

    return this.generateUserTokens(user.id, res);
  }

  logout() {}

  async refreshTokens(refreshToken: string, res: Response) {
    const token = await this.prisma.refreshToken.findFirst({
      where: {
        token: refreshToken,
        expiryDate: {
          gte: new Date(),
        },
      },
    });

    if (!token) throw new UnauthorizedException('Refresh token invalid');

    await this.prisma.refreshToken.delete({
      where: {
        id: token.id,
      },
    });

    return this.generateUserTokens(token.userId, res);
  }

  hashData(data: string) {
    return bcrypt.hash(data, 10);
  }

  async generateUserTokens(
    userId: string,
    res: Response,
  ): Promise<{ access_token: string }> {
    const access_token = this.jwtService.sign(
      {
        sub: userId,
      },
      {
        expiresIn: '1h',
      },
    );

    const refresh_token = uuidv4();
    await this.storeRefreshToken(refresh_token, userId);
    try {
      res.cookie('refresh_token', refresh_token, {
        httpOnly: true,
        secure: false,
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000,
        path: '/',
      });
    } catch (err) {
      console.log('error sending cookie');
    }

    return {
      access_token,
    };
  }

  async storeRefreshToken(token: string, userId: string) {
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + 7);

    await this.prisma.refreshToken.upsert({
      where: {
        userId,
      },
      update: {
        expiryDate,
        token,
      },
      create: {
        token,
        expiryDate,
        userId,
      },
    });
  }
}
