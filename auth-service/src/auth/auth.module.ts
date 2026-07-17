import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

const jwtExpiresIn = process.env.JWT_EXPIRES_IN || '15m';

@Module({
  imports: [
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'fallback_secret',
      signOptions: { expiresIn: jwtExpiresIn as any },
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService],
})
export class AuthModule {}