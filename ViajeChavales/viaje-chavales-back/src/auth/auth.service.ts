import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { jwtConfig } from 'src/core/consts/jwt-config';
import { PrismaService } from 'src/db.service';
import { UserDto } from 'src/users/dto/user.dto';
import { LoginUserDto } from './dto/login.dto';

@Injectable()
export class AuthService {

    constructor(readonly prisma: PrismaService, readonly jwt: JwtService) {}

    async getUser(loginDto: LoginUserDto): Promise<UserDto> {
        return await this.prisma.user.findUnique({
            where: { username: loginDto.username },
        });
    }

    async login(user: UserDto): Promise<{access_token:string}> {
        const payload = { sub: user.username, group: user.groupId};
        return  {
            access_token: await this.jwt.signAsync(payload, jwtConfig),
        };
    }
}
