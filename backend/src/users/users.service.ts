import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpsertUserDto } from './dto/user.interface';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async upsertByEmail(data: UpsertUserDto) {
    const isFirstUser = (await this.prisma.user.count()) === 0;

    return this.prisma.user.upsert({
      where: { email: data.email },
      update: {
        full_name: data.fullName,
        avatar_url: data.avatarUrl,
        ...(data.provider && { provider: data.provider }),
        ...(data.accessToken && { access_token: data.accessToken }),
        ...(data.refreshToken && { refresh_token: data.refreshToken }),
      },
      create: {
        email: data.email,
        full_name: data.fullName,
        avatar_url: data.avatarUrl,
        provider: data.provider || 'google',
        access_token: data.accessToken,
        refresh_token: data.refreshToken,
        role: isFirstUser ? 'admin' : 'user',
      },
    });
  }

  async findById(id: string) {
    return this.prisma.user.findUnique({
      where: { id },
    });
  }
}
