import { Injectable, NestMiddleware, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { jwtConfig } from 'src/core/consts/jwt-config';

@Injectable()
export class AuthMiddleware implements NestMiddleware {

  constructor( private jwtService: JwtService){}


  async use(req: any, res: any, next: () => void) {
    const token = req.headers['authorization']?.split(' ')[1];
    if(!token){
      return res.json(new UnauthorizedException('Token not provided'));
    }
    try {
      const payload = await this.jwtService.verifyAsync(token, {
        secret: jwtConfig.secret
      });
      req['user'] = payload;
      next();
    } catch {
      return res.json(new UnauthorizedException('Invalid or expired token'));
    }
  }
}
