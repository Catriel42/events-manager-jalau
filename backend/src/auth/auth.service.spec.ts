import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';

describe('AuthService', () => {
  let service: AuthService;

  const mockUsersService = {
    upsertByEmail: jest.fn(),
  };
  const mockJwtService = {
    sign: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UsersService, useValue: mockUsersService },
        { provide: JwtService, useValue: mockJwtService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  it('debería estar definido', () => {
    expect(service).toBeDefined();
  });

  describe('validateOAuthUser', () => {
    it('debería crear/actualizar usuario y devolver un token', async () => {
      const userData = {
        email: 'cato@example.com',
        fullName: 'Cato',
        avatarUrl: 'url',
      };
      const dbUser = {
        id: 'uuid-123',
        email: 'cato@example.com',
        full_name: 'Cato',
        avatar_url: 'url',
        created_at: new Date(),
        updated_at: new Date(),
      };
      const fakeToken = 'jwt.token.here';

      mockUsersService.upsertByEmail.mockResolvedValue(dbUser);
      mockJwtService.sign.mockReturnValue(fakeToken);

      const result = await service.validateOAuthUser(userData);

      expect(mockUsersService.upsertByEmail).toHaveBeenCalledWith(userData);
      expect(mockJwtService.sign).toHaveBeenCalledWith({
        sub: 'uuid-123',
        email: 'cato@example.com',
      });
      expect(result).toEqual({ user: dbUser, accessToken: fakeToken });
    });
  });
});
