import { BadRequestException, Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from 'src/db.service';
import { CreateOrderDto } from './dto/create-order.dto';


@Injectable()
export class OrdersService {

  constructor(private prisma: PrismaService){}

  async addOrder(data: Prisma.OrderCreateInput, sales: Prisma.SaleUncheckedCreateInput[]) {
    try {
      return await this.prisma.$transaction(async () => {
        
        const order = await this.prisma.order.create({data});
        await this.createSales(sales);
        return order;
        
      });
    } catch (error) {
      console.error('Error in addOrder:', error);
      return new BadRequestException(`Something went wrong... Order haven't been placed`);
    }
  }

  async createSales(sales: Prisma.SaleUncheckedCreateInput[]) {
    const salesPromises = sales.map(async (data) => {
      const product = await this.prisma.product.findUnique({
        where: { id: data.productId },
      });

      if (!product) {
        throw new BadRequestException(`Product with id ${data.productId} not found.`);
      }

      const newStock = product.stock - data.quantity;
      if (newStock < 0) {
        throw new BadRequestException(
          `Not enough stock for product with id ${data.productId}.`
        );
      }

      // Actualiza el stock del producto
      await this.prisma.product.update({
        where: { id: data.productId },
        data: { stock: newStock },
      });

      // Crea la venta
      return this.prisma.sale.create({ data });
    });

    // Espera a que todas las ventas se creen antes de continuar
    return await Promise.all(salesPromises);
  }



  async findOrders(authorId: Prisma.OrderWhereInput) {
    let response = [];

    const orders = await this.prisma.order.findMany({where:authorId});

    for (const order of orders) {
      const sales = await this.prisma.sale.findMany({ where: { orderId: order.id } });
      const orderRes: CreateOrderDto = {...order,sales};
      response.push(orderRes);
    }
      
    return response;
  }

  async findSales(sellerId: Prisma.SaleWhereInput) {
    return await this.prisma.sale.findMany({where:sellerId});
  }

  async findOrderById(id: Prisma.OrderWhereUniqueInput) {
    const order = await this.prisma.order.findUnique({where:id});
    const sales = await this.prisma.sale.findMany({where:{orderId: order.id}});
    return {...order,sales};
  }

}
