import { Body, Controller, Post, Res } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { Response } from 'express';
import { UsersService } from 'src/users/users.service';
import { AuthService } from './auth.service';
import { LoginUserDto } from './dto/login-user.dto';
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService, private usersService: UsersService) {}

  @Post()
  async login(@Body() data: LoginUserDto, @Res() res:Response){
    const email = data.email;
    const user = await this.usersService.userExists({email})
    if(!user){
      return res.status(404).json({message: "User not found"});
    }else{
      const validPassword = await bcrypt.compare(data.password,user.password)
      if(validPassword){
        const jwt = await this.authService.login(user);
        const {password,...userData} = user;
        return res.status(200).json({jwt, userData});
      }
      return res.status(401).json({message: 'Invalid password'});
    }
  }
}
