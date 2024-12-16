import { Body, Controller, Delete, Get, HttpCode, Param, Patch, Post, Query, Res } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { Response } from 'express';
import { ProductsService } from 'src/products/products.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService, private readonly productsService: ProductsService) {}

  @Post()
  @HttpCode(201)
  async create(@Body() createUserDto: CreateUserDto, @Res() res:Response) {
    const user = await this.usersService.userExists({email: createUserDto.email});
    if(user){
      return res.status(400).json({message: "User already exists"});
    }
    const saltOrRounds = 10;
    const password = createUserDto.password;
    const hash = await bcrypt.hash(password, saltOrRounds);
    createUserDto.password = hash;
    return res.status(201).json(await this.usersService.createUser(createUserDto));
  }

  @Get()
  async findUser(@Query('email') email: string, @Res() res:Response) {
    const user = await this.usersService.userExists({email});
    if(!user){
      return res.status(404).json({message: "User not found"});
    }else{
      return res.status(200).json(user);
    }
  }

  //ESTE ES PARA VER PERFIL PUBLICO DE UN USUARIO
  @Get(':id')
  async findOne(@Param('id') id: string, @Res() res:Response) {
    const user = await this.usersService.userById({ id: Number(id) });
    if(!user){
      return res.status(404).json({message: "User not found"});
    }else{
      if(user.role == 'BUSINESS'){
        const filter = {
          authorId: +id,
          stock: {gt: 0}
        }
        const products = await this.productsService.findAll(filter);
        return res.status(200).json({user, products});
      }else{
        return res.status(200).json(user);
      }
    }
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(+id, updateUserDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.usersService.remove(+id);
  }
}
