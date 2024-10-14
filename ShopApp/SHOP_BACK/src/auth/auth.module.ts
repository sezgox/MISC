import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from 'src/db.service';
import { UsersService } from 'src/users/users.service';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

@Module({
  imports:[ConfigModule],
  controllers: [AuthController],
  providers: [AuthService, PrismaService, UsersService, JwtService],
})
export class AuthModule {}
