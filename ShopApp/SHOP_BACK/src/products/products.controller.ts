import { Body, Controller, Delete, Get, Param, Patch, Post, Query, Req, Res, UseGuards } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request, Response } from 'express';
import { BusinessGuard } from 'src/guards/business/business.guard';
import { CreateProductDto } from './dto/create-product.dto';
import { ProductsService } from './products.service';


@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService, private jwtService: JwtService) {}

  @UseGuards(BusinessGuard)
  @Post()
  async create(@Body() createProductDto: CreateProductDto,@Req() req: Request, @Res() res: Response) {
    const product = {...createProductDto};
    product.authorId = req['user'].sub;
    const sellerProducts = await this.productsService.findAll({authorId: req['user'].sub});
    const productIsDuplicated = sellerProducts.products.find(sellerProduct => sellerProduct.name == product.name);
    if(productIsDuplicated){
      return res.status(400).json({message: "Product already exists"});
    }else{
      const createdProduct = await this.productsService.create(product);
      return res.status(201).json(createdProduct);
    }
  }

  @Get()
  async findAll(@Res() res: Response, @Req() req: Request, @Query('page') page: number, @Query('category') category?:string, @Query('pageSize') pageSize?:number, @Query('onlyAvailable') onlyAvailable?:string) {
    let filter: any = {}
    const token = req.headers['authorization']?.split(' ')[1];
    const decodedToken = await this.jwtService.decode(token);
    if(decodedToken && decodedToken.role == 'BUSINESS'){
      filter.authorId = decodedToken.sub;
    }

    if(onlyAvailable == 'true'){
      filter.stock = {gt: 0}
    }
    if(category){
      filter.categories = {has: category};
    }
    if(page <= 0 || !page){  page = 1 }
    const response = await this.productsService.findAll(filter,page,Number(pageSize));
    if(response.products.length > 0){
      return res.status(200).json(response);
    }else{
      return res.status(404).json({message: "Page invalid, no more products to show"});
    }
  }
  
  @Get(':id')
  async findOne(@Param('id') id: string, @Res() res: Response) {
    const prodcut = await this.productsService.findOne({id: +id});
    if(prodcut){
      return res.status(200).json(prodcut);
    }else{
      return res.status(404).json({message: 'Product not found'});
    }
  }

  @UseGuards(BusinessGuard)
  @Patch(':id')
  async update(@Param('id') id: string, @Body() updateProductDto: CreateProductDto,  @Req() req: Request, @Res() res: Response) {
    const product = await this.productsService.findOne({id: +id});
    console.log(updateProductDto)
    if(product){
      const userIsOwner = product.authorId == req['user'].sub;
      return userIsOwner ? res.status(200).json(await this.productsService.update({id:+id}, updateProductDto)) : res.status(401).json({message: 'User trying to change a product is not them'});
    }else{
      return res.status(404).json({message: 'Product not found'});
    }
  }

  @UseGuards(BusinessGuard)
  @Delete(':id')
  async remove(@Param('id') id: string, @Req() req: Request, @Res() res: Response) {
    const product =  await this.productsService.findOne({id: +id});
    if(product){
      const userIsOwner = product.authorId == req['user'].sub;
      return userIsOwner ? res.status(200).json(await this.productsService.remove({id:+id})) : res.status(401).json({message: 'User trying to change a product is not them'});
    }else{
      return res.status(404).json({message: 'Product not found'});
    }
  }

}
