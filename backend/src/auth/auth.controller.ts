import {
  Controller,
  Get,
  UseGuards,
  Req,
  Res,
  Query,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { GoogleAuthGuard } from './guards/google-auth.guard';
import { MicrosoftAuthGuard } from './guards/microsoft-auth.guard';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '@users/users.service';
import { AuthService } from './auth.service';
import type { Response } from 'express';
import type { RequestWithUser, RequestWithJwt } from './dto/auth-payload.dto';

@Controller('auth')
export class AuthController {
  constructor(
    private configService: ConfigService,
    private usersService: UsersService,
    private authService: AuthService,
  ) {}

  @Get('bypass')
  async bypassAuth(@Query('email') email: string, @Query('name') name: string) {
    const isProduction =
      this.configService.get<string>('NODE_ENV') === 'production';
    if (isProduction) {
      throw new ForbiddenException('Bypass auth is not allowed in production');
    }

    if (!email || !name) {
      throw new BadRequestException('Email and name are required');
    }

    return this.authService.validateOAuthUser({
      email,
      fullName: name,
      provider: 'mock-bypass',
    });
  }

  @Get('google')
  @UseGuards(GoogleAuthGuard)
  async googleAuth() {}

  @Get('google/callback')
  @UseGuards(GoogleAuthGuard)
  googleAuthRedirect(@Req() req: RequestWithUser, @Res() res: Response) {
    const { accessToken } = req.user;
    const frontendUrl = this.configService.get<string>('FRONTEND_URL');

    return res.redirect(`${frontendUrl}/auth/callback?token=${accessToken}`);
  }

  @Get('microsoft')
  @UseGuards(MicrosoftAuthGuard)
  async microsoftAuth() {}

  @Get('microsoft/callback')
  @UseGuards(MicrosoftAuthGuard)
  microsoftAuthRedirect(@Req() req: RequestWithUser, @Res() res: Response) {
    const { accessToken } = req.user;
    const frontendUrl = this.configService.get<string>('FRONTEND_URL');

    return res.redirect(`${frontendUrl}/auth/callback?token=${accessToken}`);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  async getProfile(@Req() req: RequestWithJwt) {
    return this.usersService.findById(req.user.id);
  }
}
