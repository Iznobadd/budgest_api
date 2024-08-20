import {
  Body,
  Controller,
  Post,
  Req,
  Res,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthDto } from './dto';
import { Request, Response } from 'express';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('/register')
  async register(@Body() authDto: AuthDto, @Res() res: Response) {
    const tokens = await this.authService.register(authDto, res);
    return res.json(tokens);
  }

  @Post('/login')
  async login(@Body() authDto: AuthDto, @Res() res: Response) {
    const tokens = await this.authService.login(authDto, res);
    return res.json(tokens);
  }

  @Post('/logout')
  logout() {
    this.authService.logout();
  }

  @Post('/refresh')
  async refreshTokens(@Req() req: Request, @Res() res: Response) {
    const refreshToken = req.cookies['refresh_token'];

    if (!refreshToken)
      throw new UnauthorizedException('No refresh token found');

    const tokens = await this.authService.refreshTokens(refreshToken, res);
    return res.json(tokens);
  }
}
