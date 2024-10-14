import { Injectable, NestMiddleware, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthMiddleware implements NestMiddleware {

  constructor( private jwtService: JwtService, private configService: ConfigService){}


  async use(req: any, res: any, next: () => void) {
    const token = req.headers['authorization']?.split(' ')[1];
    if(!token){
      return res.json(new UnauthorizedException('Token not provided'));
    }
    try {
      const payload = await this.jwtService.verifyAsync(token, {
        secret: this.configService.get<string>('SECRET_KEY'),
      });
      req['user'] = payload;
      next();
    } catch {
      return res.json(new UnauthorizedException('Invalid or expired token'));
    }
  }
}
