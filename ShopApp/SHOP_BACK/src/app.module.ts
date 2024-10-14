import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { ProductsModule } from './products/products.module';
import { UsersModule } from './users/users.module';
import { OrdersModule } from './orders/orders.module';

@Module({
  imports: [UsersModule, AuthModule, ConfigModule.forRoot({ isGlobal: true, envFilePath: '.env'}), ProductsModule, OrdersModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
