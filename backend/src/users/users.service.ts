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
      },
      create: {
        email: data.email,
        full_name: data.fullName,
        avatar_url: data.avatarUrl,
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
