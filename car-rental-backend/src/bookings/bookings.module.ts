import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { BookingsService } from './bookings.service';
import { BookingsController } from './bookings.controller';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [JwtModule, AuthModule],
  providers: [BookingsService],
  controllers: [BookingsController],
})
export class BookingsModule {}
