import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpsertUserDto } from './dto/user.interface';
import { UpdateUserDto } from './dto/update-user.dto';

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

  async findAll() {
    return this.prisma.user.findMany({
      orderBy: { created_at: 'desc' },
    });
  }

  async findById(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    await this.findById(id); // Check existence
    return this.prisma.user.update({
      where: { id },
      data: {
        ...(updateUserDto.role && { role: updateUserDto.role }),
      },
    });
  }

  async remove(id: string) {
    await this.findById(id); // Check existence
    return this.prisma.user.delete({
      where: { id },
    });
  }
}
