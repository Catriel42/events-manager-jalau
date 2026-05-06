import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-microsoft';
import { Profile } from 'passport';
import { ConfigService } from '@nestjs/config';
import { AuthService } from '../auth.service';
import { UserEntity } from '@users/dto/user.interface';

@Injectable()
export class MicrosoftStrategy extends PassportStrategy(Strategy, 'microsoft') {
  constructor(
    configService: ConfigService,
    private authService: AuthService,
  ) {
    super({
      clientID: configService.get<string>('MICROSOFT_CLIENT_ID')!,
      clientSecret: configService.get<string>('MICROSOFT_CLIENT_SECRET')!,
      callbackURL: configService.get<string>('MICROSOFT_CALLBACK_URL')!,
      scope: ['user.read', 'Calendars.ReadWrite', 'offline_access'],
      tenant: configService.get<string>('MICROSOFT_TENANT_ID', 'common'),
    });
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: Profile & {
      _json?: { userPrincipalName?: string; mail?: string };
    },
    done: (
      err: Error | null,
      user: { user: UserEntity; accessToken: string },
    ) => void,
  ): Promise<void> {
    const { emails, displayName, _json } = profile;

    const email = emails?.[0]?.value || _json?.userPrincipalName || _json?.mail;

    if (!email) {
      throw new UnauthorizedException('No email provided by Microsoft');
    }

    const user = await this.authService.validateOAuthUser({
      email,
      fullName: displayName || 'Microsoft User',
      avatarUrl: undefined,
      provider: 'microsoft',
      accessToken,
      refreshToken,
    });

    done(null, user);
  }
}
