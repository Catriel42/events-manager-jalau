import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { PrismaService } from '../prisma/prisma.service';

describe('UsersService', () => {
  let service: UsersService;

  const mockPrisma = {
    user: {
      upsert: jest.fn().mockImplementation(() => Promise.resolve()),
      findUnique: jest.fn().mockImplementation(() => Promise.resolve()),
      count: jest.fn().mockImplementation(() => Promise.resolve(1)),
    },
  };

  beforeEach(async (): Promise<void> => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: PrismaService,
          useValue: mockPrisma,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('upsertByEmail', () => {
    it('should call prisma.user.upsert with correct data', async () => {
      const userData = {
        email: 'test@example.com',
        fullName: 'Test User',
        avatarUrl: 'http://avatar.com',
        provider: 'google',
        accessToken: 'access',
        refreshToken: 'refresh',
      };

      const expectedResult = {
        id: 'uuid',
        ...userData,
        full_name: userData.fullName,
        avatar_url: userData.avatarUrl,
      };
      mockPrisma.user.upsert.mockResolvedValue(expectedResult);

      const result = await service.upsertByEmail(userData);

      expect(mockPrisma.user.upsert).toHaveBeenCalledWith({
        where: { email: userData.email },
        update: {
          full_name: userData.fullName,
          avatar_url: userData.avatarUrl,
          provider: userData.provider,
          access_token: userData.accessToken,
          refresh_token: userData.refreshToken,
        },
        create: {
          email: userData.email,
          full_name: userData.fullName,
          avatar_url: userData.avatarUrl,
          role: 'user',
          provider: userData.provider,
          access_token: userData.accessToken,
          refresh_token: userData.refreshToken,
        },
      });
      expect(result).toEqual(expectedResult);
    });
  });

  describe('findById', () => {
    it('should return a user if found', async () => {
      const mockUser = { id: 'uuid', email: 'test@example.com' };
      mockPrisma.user.findUnique.mockResolvedValue(mockUser);

      const result = await service.findById('uuid');

      expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({
        where: { id: 'uuid' },
      });
      expect(result).toEqual(mockUser);
    });
  });
});
