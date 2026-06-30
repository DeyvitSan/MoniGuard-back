import { Module } from '@nestjs/common';
import { PrismaModule } from './auth/prisma/prisma.module';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [
    PrismaModule,
    AuthModule,
  ],
})
export class AppModule {}