import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from 'src/db.service';


@Injectable()
export class ProductsService {

  constructor(private prisma: PrismaService){}

  async create(data: Prisma.ProductCreateInput) {
    try {
      const response = await this.prisma.product.create({data});
      return response
    } catch (error) {
      console.log(error)
      return error
    }
  }

  async findAll(filter?: Prisma.ProductWhereInput,page : number = 1, pageSize?: number) {
    try {
      const totalProducts = await this.prisma.product.count({ where: filter });
      if(!pageSize){
        const products = await this.prisma.product.findMany({where: filter} );
        return{products, totalProducts}
      }else{
        const skip = (page - 1) * pageSize;
        const products = await this.prisma.product.findMany({where: filter, skip, take: pageSize});
        return {products, totalProducts}
      }
    } catch (error) {
      console.log(error)
      return error
    }
  }

  async findOne(id: Prisma.ProductWhereUniqueInput) {
    try {
      const response = await this.prisma.product.findUnique({where: id});
      return response
    } catch (error) {
      console.log(error)
      return null
    }
  }

  async update(id:  Prisma.ProductWhereUniqueInput, updatedProduct: Prisma.ProductCreateInput) {
    try {
      const response = await this.prisma.product.update({where: id, data:updatedProduct});
      return response
    } catch (error) {
      console.log(error)
      return error
    }
  }

  async remove(id: Prisma.ProductWhereUniqueInput) {
    try {
      const response = await this.prisma.product.delete({where: id});
      return response
    } catch (error) {
      if(error.code === 'P2003'){
        const product = await this.prisma.product.findUnique({where: id});
        product.stock = 0;
        await this.prisma.product.update({where: id, data: product});
        return product
      }else{
        console.log(error)
        return error
      }
    }
  }

}
