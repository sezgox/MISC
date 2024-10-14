import { MiddlewareConsumer, Module } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UuidService } from 'nestjs-uuid';
import { PrismaService } from 'src/db.service';
import { AuthMiddleware } from 'src/middlewares/auth/auth.middleware';
import { ProductsService } from 'src/products/products.service';
import { UsersService } from 'src/users/users.service';
import { OrdersController } from './orders.controller';
import { OrdersService } from './orders.service';

@Module({
  controllers: [OrdersController],
  providers: [OrdersService, PrismaService, UuidService, UsersService, ProductsService, JwtService],
})
export class OrdersModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(AuthMiddleware)
    .forRoutes(OrdersController);
}
}
