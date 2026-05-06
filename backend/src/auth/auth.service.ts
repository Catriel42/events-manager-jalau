import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '@users/users.service';
import { AuthPayload } from './dto/auth-payload.dto';
import { UpsertUserDto } from '@users/dto/user.interface';

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    private usersService: UsersService,
  ) {}

  async validateOAuthUser(userData: UpsertUserDto) {
    if (!userData.email.endsWith('@jala.university')) {
      throw new UnauthorizedException(
        'Access denied: Only Jala University accounts are allowed.',
      );
    }

    const user = await this.usersService.upsertByEmail(userData);

    const payload: AuthPayload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };

    return {
      user,
      accessToken: this.jwtService.sign(payload),
    };
  }
}
