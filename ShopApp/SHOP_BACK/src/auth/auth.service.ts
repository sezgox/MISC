import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { User } from '@prisma/client';


@Injectable()
export class AuthService {

    constructor( private jwtService: JwtService, private configService: ConfigService){}

    async login(user: User): Promise<string>{
        const payload = { sub: user.id, role: user.role, email: user.email };
        return await this.jwtService.signAsync(payload,
            {
            secret: this.configService.get<string>('SECRET_KEY'),
            expiresIn: '1h'
            }
        );
    }

}
