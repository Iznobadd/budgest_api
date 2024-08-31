import {
  Body,
  Controller,
  Post,
  Req,
  Res,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto, RegisterDto } from './dto';
import { Request, Response } from 'express';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('/register')
  async register(@Body() registerDto: RegisterDto, @Res() res: Response) {
    const tokens = await this.authService.register(registerDto, res);
    return res.json(tokens);
  }

  @Post('/login')
  async login(@Body() LoginDto: LoginDto, @Res() res: Response) {
    const tokens = await this.authService.login(LoginDto, res);
    return res.json(tokens);
  }

  @Post('/logout')
  logout() {
    this.authService.logout();
  }

  @Post('/refresh')
  async refreshTokens(@Req() req: Request, @Res() res: Response) {
    const refreshToken = req.cookies['refresh_token'];

    if (!refreshToken) {
      throw new UnauthorizedException('No refresh token found');
    }

    try {
      const tokens = await this.authService.refreshTokens(refreshToken, res);
      return res.json(tokens);
    } catch (error) {
      console.error('Error refreshing tokens:', error);
      return res.status(401).json({ message: 'Failed to refresh tokens' });
    }
  }
}
