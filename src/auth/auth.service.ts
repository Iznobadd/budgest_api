import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { AuthDto } from './dto';
import * as bcrypt from 'bcrypt';
import { Tokens } from './types';
import { JwtService } from '@nestjs/jwt';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async register(dto: AuthDto): Promise<Tokens> {
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

    const tokens = await this.generateUserTokens(newUser.id);
    return tokens;
  }

  async login(dto: AuthDto): Promise<Tokens> {
    const user = await this.prisma.user.findUnique({
      where: {
        email: dto.email,
      },
    });

    if (!user) throw new UnauthorizedException('Wrong credentials');

    const passwordMatches = await bcrypt.compare(dto.password, user.password);
    if (!passwordMatches) throw new UnauthorizedException('Wrong credentials');

    return this.generateUserTokens(user.id);
  }

  logout() {}

  async refreshTokens(refreshToken: string) {
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

    return this.generateUserTokens(token.userId);
  }

  hashData(data: string) {
    return bcrypt.hash(data, 10);
  }

  async generateUserTokens(userId: string): Promise<Tokens> {
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
    return {
      access_token,
      refresh_token,
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
