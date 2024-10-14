import { Body, Controller, Delete, Get, HttpCode, NotFoundException, Param, Patch, Post } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { ProductsService } from 'src/products/products.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService, private readonly productsService: ProductsService) {}

  @Post()
  @HttpCode(201)
  async create(@Body() createUserDto: CreateUserDto) {
    const saltOrRounds = 10;
    const password = createUserDto.password;
    const hash = await bcrypt.hash(password, saltOrRounds);
    createUserDto.password = hash;
    return this.usersService.createUser(createUserDto);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    //TODO: AGREGAR SALES Y ORDERS DE USUARIO
    const user = await this.usersService.userById({ id: Number(id) });
    const products = await this.productsService.findAll({authorId: +id});
    if(!user){
      return new NotFoundException('User not found')
    }else{
      return user.role == 'BUSINESS' ? { ...user, products: products } : user;
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
