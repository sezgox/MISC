import { Body, Controller, NotFoundException, Post, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { UsersService } from 'src/users/users.service';
import { AuthService } from './auth.service';
import { LoginUserDto } from './dto/login-user.dto';
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService, private usersService: UsersService) {}

  @Post()
  async login(@Body() data: LoginUserDto){
    const email = data.email;
    const user = await this.usersService.userExists({email})
    if(!user){
      return new NotFoundException('User not found')
    }else{
      const validPassword = await bcrypt.compare(data.password,user.password)
      if(validPassword){
        const jwt = await this.authService.login(user);
        const userData = user.role == 'PERSONAL' ? {email: user.email,firstName:user.firstName,lastName:user.lastName, role:user.role} : {email: user.email,businessName:user.businessName, country: user.country, role:user.role};
        return {jwt, userData}
      }
      return new UnauthorizedException('Invalid credentials');
    }
  }
}
