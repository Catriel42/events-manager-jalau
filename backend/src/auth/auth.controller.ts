import { Controller, Get, UseGuards, Req, Res } from '@nestjs/common';
import { GoogleAuthGuard } from './guards/google-auth.guard';
import { MicrosoftAuthGuard } from './guards/microsoft-auth.guard';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '@users/users.service';
import type { Response } from 'express';
import type { RequestWithUser, RequestWithJwt } from './dto/auth-payload.dto';

@Controller('auth')
export class AuthController {
  constructor(
    private configService: ConfigService,
    private usersService: UsersService,
  ) {}

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
