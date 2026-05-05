import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';

describe('AuthService', () => {
  let service: AuthService;
  let usersService: jest.Mocked<UsersService>;
  let jwtService: jest.Mocked<JwtService>;

  beforeEach(async () => {
    const mockUsersService = {
      upsertByEmail: jest.fn(),
    };
    const mockJwtService = {
      sign: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UsersService, useValue: mockUsersService },
        { provide: JwtService, useValue: mockJwtService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    usersService = module.get(UsersService);
    jwtService = module.get(JwtService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('validateOAuthUser', () => {
    it('should create or update a user and return a token', async () => {
      const userData = { email: 'cato@example.com', fullName: 'Cato', avatarUrl: 'url' };
      const dbUser = { id: 'uuid-123', email: 'cato@example.com', full_name: 'Cato', avatar_url: 'url' };
      const fakeToken = 'jwt.token.here';
      usersService.upsertByEmail.mockResolvedValue(dbUser as any);
      jwtService.sign.mockReturnValue(fakeToken);

      const result = await service.validateOAuthUser(userData);

      expect(usersService.upsertByEmail).toHaveBeenCalledWith(userData);
      expect(jwtService.sign).toHaveBeenCalledWith({ sub: 'uuid-123', email: 'cato@example.com' });
      expect(result).toEqual({
        user: dbUser,
        accessToken: fakeToken,
      });
    });
  });
});
