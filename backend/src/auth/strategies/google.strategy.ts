import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import {
  Strategy,
  Profile,
  VerifyCallback,
  StrategyOptions,
} from 'passport-google-oauth20';
import { ConfigService } from '@nestjs/config';
import { AuthService } from '../auth.service';

interface GoogleStrategyOptions extends StrategyOptions {
  accessType?: string;
  prompt?: string;
}

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(
    configService: ConfigService,
    private authService: AuthService,
  ) {
    super({
      clientID: configService.get<string>('GOOGLE_CLIENT_ID')!,
      clientSecret: configService.get<string>('GOOGLE_CLIENT_SECRET')!,
      callbackURL: configService.get<string>('GOOGLE_CALLBACK_URL')!,
      scope: [
        'email',
        'profile',
        'https://www.googleapis.com/auth/calendar.events',
      ],
      accessType: 'offline',
      prompt: 'consent',
    } as GoogleStrategyOptions);
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: Profile,
    done: VerifyCallback,
  ): Promise<void> {
    const { emails, displayName, photos } = profile;

    if (!emails || emails.length === 0) {
      throw new UnauthorizedException('No email provided by Google');
    }

    const user = await this.authService.validateOAuthUser({
      email: emails[0].value,
      fullName: displayName,
      avatarUrl: photos?.[0]?.value,
      provider: 'google',
      accessToken,
      refreshToken,
    });

    done(null, user);
  }
}
