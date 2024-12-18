import { Body, Controller, Post, Res, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { Response } from 'express';
import { HttpResponse } from 'src/core/interfaces/response';
import { AuthService } from './auth.service';
import { LoginUserDto } from './dto/login.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post()
  async login(@Body() loginUserDto: LoginUserDto, @Res() res: Response): Promise<Response<HttpResponse<{access_token: string}>>> {
    const user = await this.authService.getUser(loginUserDto);
    if(user && bcrypt.compareSync(loginUserDto.password, user.password)){
      return res.json(await this.authService.login(user));
    }else{
      res.status(401);
      return res.json(new UnauthorizedException("Invalid username or password"));
    }
  }

}
