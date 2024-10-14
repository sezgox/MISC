import { Body, Controller, Delete, Get, NotFoundException, Param, Patch, Post, Req, UnauthorizedException, UseGuards } from '@nestjs/common';
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
    product.authorId = req['user'].sub;
    return this.productsService.create(product);
  }

  @Get()
  findAll() {
    return this.productsService.findAll();
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
