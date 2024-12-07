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
        const response = await this.prisma.product.findMany({where: filter} );
        return {data: {products: response, totalProducts}}
      }else{
        const skip = (page - 1) * pageSize;
        const response = await this.prisma.product.findMany({where: filter, skip, take: pageSize});
        return {data: {products: response, totalProducts}}
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
      return error
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
      console.log(error)
      return error
    }
  }

}
