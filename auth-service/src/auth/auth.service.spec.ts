import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { AuthService } from './auth.service';
import { PrismaService } from './prisma/prisma.service';

jest.mock('bcryptjs', () => ({
  compare: jest.fn(),
  hash: jest.fn(),
}));

describe('AuthService', () => {
  let service: AuthService;
  let prisma: {
    user: {
      findUnique: jest.Mock;
      update: jest.Mock;
      create: jest.Mock;
    };
  };

  beforeEach(async () => {
    prisma = {
      user: {
        findUnique: jest.fn(),
        update: jest.fn(),
        create: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: prisma },
        { provide: JwtService, useValue: { signAsync: jest.fn(), verifyAsync: jest.fn() } },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  it('should update the name of an existing user', async () => {
    prisma.user.update.mockResolvedValue({
      id: 'user-1',
      nombre: 'Nuevo Nombre',
      email: 'test@example.com',
      createdAt: new Date(),
    });

    const result = await service.updateName('user-1', 'Nuevo Nombre');

    expect(prisma.user.update).toHaveBeenCalledWith({
      where: { id: 'user-1' },
      data: { nombre: 'Nuevo Nombre' },
    });
    expect(result.user.nombre).toBe('Nuevo Nombre');
  });

  it('should update the password when the current password is correct', async () => {
    prisma.user.findUnique.mockResolvedValue({
      id: 'user-1',
      nombre: 'Nombre',
      email: 'test@example.com',
      password: 'hashed-current',
    });
    prisma.user.update.mockResolvedValue({
      id: 'user-1',
      nombre: 'Nombre',
      email: 'test@example.com',
      createdAt: new Date(),
    });
    (bcrypt.compare as jest.Mock).mockResolvedValue(true);
    (bcrypt.hash as jest.Mock).mockResolvedValue('hashed-new');

    const result = await service.updatePassword('user-1', 'current-pass', 'new-pass');

    expect(prisma.user.update).toHaveBeenCalledWith({
      where: { id: 'user-1' },
      data: { password: 'hashed-new' },
    });
    expect(result.message).toBe('Contraseña actualizada correctamente');
  });
});
