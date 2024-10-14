import { MiddlewareConsumer, Module, NestModule, RequestMethod } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from 'src/db.service';
import { AuthMiddleware } from 'src/middlewares/auth/auth.middleware';
import { ProductsController } from './products.controller';
import { ProductsService } from './products.service';

@Module({
  controllers: [ProductsController],
  providers: [ProductsService,JwtService, PrismaService],
})
export class ProductsModule implements NestModule {

  configure(consumer: MiddlewareConsumer) {
      consumer.apply(AuthMiddleware)
      .exclude(
        {path: 'products', method:RequestMethod.GET},
        {path: 'products/:id', method:RequestMethod.GET}
      )
      .forRoutes(ProductsController);
  }
}
