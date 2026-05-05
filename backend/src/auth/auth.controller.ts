import { Controller, Get, UseGuards, Req, Res } from '@nestjs/common';
import { GoogleAuthGuard } from './guards/google-auth.guard';
import { ConfigService } from '@nestjs/config';
import type { Response } from 'express';
import type { RequestWithUser } from './dto/auth-payload.dto';

@Controller('auth')
export class AuthController {
  constructor(private configService: ConfigService) {}

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
}
