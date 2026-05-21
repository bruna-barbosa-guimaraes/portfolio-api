import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';

describe('AuthService', () => {
  let service: AuthService;
  const usersService = {
    findByEmail: jest.fn(),
  };
  const jwtService = {
    signAsync: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UsersService,
          useValue: usersService,
        },
        {
          provide: JwtService,
          useValue: jwtService,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should validate credentials and return a JWT', async () => {
    const passwordHash = await bcrypt.hash('admin123', 10);
    usersService.findByEmail.mockResolvedValue({
      id: 'user-id',
      name: 'Admin',
      email: 'admin@portfolio.local',
      passwordHash,
    });
    jwtService.signAsync.mockResolvedValue('jwt-token');

    await expect(
      service.login({
        email: 'admin@portfolio.local',
        password: 'admin123',
      }),
    ).resolves.toEqual({
      accessToken: 'jwt-token',
      user: {
        id: 'user-id',
        name: 'Admin',
        email: 'admin@portfolio.local',
      },
    });
  });
});
