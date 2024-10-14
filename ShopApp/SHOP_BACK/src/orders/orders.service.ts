import { BadRequestException, Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from 'src/db.service';

@Injectable()
export class OrdersService {

  constructor(private prisma: PrismaService){}

  async addOrder(data: Prisma.OrderCreateInput, sales: Prisma.SaleCreateInput[]) {
    try {
      return await this.prisma.$transaction(async () => {
        // Primero, crea la orden
        const order = await this.prisma.order.create({data});

        // Luego, crea las ventas relacionadas
        await this.createSales(sales);

        // Devuelve la orden si todo ha ido bien
        return order;
      });
    } catch (error) {
      console.error('Error in addOrder:', error);
      return new BadRequestException(`Something went wrong... Order haven't been placed`);
    }
  }

  async createSales(sales: Prisma.SaleCreateInput[]) {
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
    return await this.prisma.order.findMany({where:authorId});
  }

  async findSales(sellerId: Prisma.SaleWhereInput) {
    return await this.prisma.sale.findMany({where:sellerId});
  }

  findOne(id: number) {
    return `This action returns a #${id} order`;
  }

}
