import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

const jwtExpiresIn = process.env.JWT_EXPIRES_IN || '15m';

// JWT_SECRET es validado como obligatorio en env.validation.ts (validateEnv,
// llamado desde main.ts antes de bootstrap). Si llegamos aquí, existe.
@Module({
  imports: [
    JwtModule.register({
      secret: process.env.JWT_SECRET as string,
      signOptions: { expiresIn: jwtExpiresIn as any },
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService],
})
export class AuthModule {}