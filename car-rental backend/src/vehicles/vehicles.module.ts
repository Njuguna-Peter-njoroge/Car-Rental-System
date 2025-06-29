import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { VehiclesController } from './vehicles.controller';
import { VehiclesService } from './vehicles.service';
import { PrismaModule } from '../prisma/prisma.module';
import {JwtService} from '@nestjs/jwt';
import {AuthModule} from '../auth/auth.module';

@Module({
  imports: [
    PrismaModule,
      AuthModule,
    // JwtModule.register({
    //   secret: process.env.JWT_SECRET || 'your-secret-key',
    //   signOptions: { expiresIn: '1h' },
    // }),
  ],
  controllers: [VehiclesController],
  providers: [VehiclesService],
  exports: [VehiclesService],
})
export class VehiclesModule {}
