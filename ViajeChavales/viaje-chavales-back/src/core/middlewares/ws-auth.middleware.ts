import { Injectable, NestMiddleware, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Socket } from 'socket.io';

@Injectable()
export class WsAuthMiddleware implements NestMiddleware {
  constructor(private jwtService: JwtService) {}

  use(socket: Socket, next: (err?: Error) => void) {
    try {
      /* // Extraer el token del handshake o de los query parameters
      const token = socket.handshake.auth?.token || 
                   socket.handshake.query?.token as string;
      
      if (!token) {
        throw new UnauthorizedException('Token no proporcionado');
      }

      // Verificar el token
      const payload = this.jwtService.verify(token);
      socket.data.user = payload; // Adjuntar los datos del usuario al socket
       */
      next();
    } catch (error) {
      next(new UnauthorizedException('Token inválido'));
    }
  }
}