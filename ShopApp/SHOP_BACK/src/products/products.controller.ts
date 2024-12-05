import { Body, Controller, Delete, Get, NotFoundException, Param, Patch, Post, Query, Req, UnauthorizedException, UseGuards } from '@nestjs/common';
import { Request } from 'express';
import { BusinessGuard } from 'src/guards/business/business.guard';
import { CreateProductDto } from './dto/create-product.dto';
import { ProductsService } from './products.service';


@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @UseGuards(BusinessGuard)
  @Post()
  create(@Body() createProductDto: CreateProductDto,@Req() req: Request) {
    const product = {...createProductDto};
    product.categories.forEach(category => category = category.toLowerCase());
    product.authorId = req['user'].sub;
    return this.productsService.create(product);
  }

  @Get()
  async findAll(@Query('page') page: number, @Query('category') category?:string, @Query('pageSize') pageSize:number = 10, @Query('authorId') authorId?: number) {
    let filter: any = {}
    if(category){
      filter.categories = {has: category};
    }
    if(!authorId){
      filter.stock = {gt: 0}
    }else{
      filter.authorId = Number(authorId);
    }
    if(page <= 0 || !page){  page = 1 }
    const response = await this.productsService.findAll(filter,page,Number(pageSize));
    if(response.products.length > 0){
      return response;
    }else{
      return new NotFoundException("Page invalid, no more products to show");
    }
  }
  
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.productsService.findOne({id: +id});
  }

  @UseGuards(BusinessGuard)
  @Patch(':id')
  async update(@Param('id') id: string, @Body() updateProductDto: CreateProductDto,  @Req() req: Request) {
    const product = await this.findOne(id);
    if(product){
      const userIsOwner = product.authorId == req['user'].sub;
      return userIsOwner ? this.productsService.update({id:+id}, updateProductDto) : new UnauthorizedException('User trying to change a product is not them');
    }else{
      return new NotFoundException('Product not found');
    }
  }

  @UseGuards(BusinessGuard)
  @Delete(':id')
  async remove(@Param('id') id: string, @Req() req: Request) {
    const product = await this.findOne(id);
    if(product){
      const userIsOwner = product.authorId == req['user'].sub;
      return userIsOwner ? this.productsService.remove({id:+id}) : new UnauthorizedException('User trying to change a product is not them');
    }else{
      return new NotFoundException('Product not found');
    }
  }

}
