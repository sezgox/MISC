import { BadRequestException, Body, Controller, Get, NotFoundException, Param, Post, Req, UseGuards } from '@nestjs/common';
import { UuidService } from 'nestjs-uuid';
import { BusinessGuard } from 'src/guards/business/business.guard';
import { PersonalGuard } from 'src/guards/personal/personal.guard';
import { ProductsService } from 'src/products/products.service';
import { UsersService } from 'src/users/users.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { OrdersService } from './orders.service';

@Controller('')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService, private readonly uuidService: UuidService, private readonly usersService: UsersService, private readonly productsService: ProductsService) {}

  productSellerDuplicated(array: any[]): boolean {
    const seen = new Set();
    

    for (const item of array) {
      const pair = `${item['sellerId']}-${item['productId']}`; // Combina los valores de ambas propiedades
      if (seen.has(pair)) {
        return true; // Hay duplicados en la combinación de ambas propiedades
      }
      seen.add(pair);
    }
    
    return false; // No hay duplicados
  }

  @UseGuards(PersonalGuard)
  @Post('orders')
  async create(@Body() createOrderDto: CreateOrderDto) {
    createOrderDto.id = this.uuidService.generate();
    createOrderDto.sales.forEach(sale => sale.orderId = createOrderDto.id);
    //COMPROBAR TOTAL_ORDEN = SUMA EACH VENTA
    const total = createOrderDto.sales.reduce((accumulator,sales) => accumulator + sales.total, 0);
    //COMPROBAR QUE TODOS LOS PRODUCTOS IGUALES DEL MISMO VENDEDOR VIENEN EN UNA ÚNICA VENTA
    if(this.productSellerDuplicated(createOrderDto.sales)){
      return new BadRequestException(`Order is not valid and haven't been placed`);
    }
    if(total == createOrderDto.total){
      for(let sale of createOrderDto.sales) {
        //COMPROBAR VENDEDOR EXISTE
        const seller = await this.usersService.userById({id:Number(sale.sellerId)});
        if(!seller){
          return new NotFoundException(`Seller not found`);
        }
        //COMPROBAR VENDEDOR TIENE PRODUCTO
        const sellerProducts = await this.productsService.findAll({authorId: Number(sale.sellerId)});
        const product = sellerProducts.find(product => product.id == sale.productId);
        if(!product || product.stock == 0 || product.stock < sale.quantity){
          return new NotFoundException(`Product doesn't belong to seller or quantity needed is over stock`);
        }
        //COMPROBAR RELACION PRODUCTO*CANTIDAD = TOTAL_VENTA
        if(sale.quantity * product.price != sale.total ){
          return new BadRequestException('Something is wrong with the prices...')
        }
        //TODO: ADD EACH SALE TO DB (AND SUBSTRACT QUANTITY TO STOCK TO EACH PRODUCT) -> IF ANY SALE CAN NOT BE MADE, STOP TRANSACTION -> IF ALL IS GOOD, THEN ADD NEW ORDER TO DB
      }
      const date = new Date(createOrderDto.date);
      const order = {id:createOrderDto.id,authorId:createOrderDto.authorId,total:createOrderDto.total,date}
      return this.ordersService.addOrder(order, createOrderDto.sales);
    }else{
      return new BadRequestException('Something is wrong with the prices...')
    }
  }

  @UseGuards(PersonalGuard)
  @Get('orders')
  findOrders( @Req() req: Request) {
    return this.ordersService.findOrders({authorId: req['user'].sub});
  }

  @UseGuards(BusinessGuard)
  @Get('sales')
  findSales( @Req() req: Request) {
    return this.ordersService.findSales({sellerId: req['user'].sub});
  }

  @UseGuards(PersonalGuard)
  @Get('orders/:id')
  findOrder(@Param('id') id: string) {
    return this.ordersService.findOne(+id);
  }

  
  @UseGuards(BusinessGuard)
  @Get('sales/:id')
  findSale(@Param('id') id: string) {
    return this.ordersService.findOne(+id);
  }

}
