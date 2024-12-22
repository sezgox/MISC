import { BadRequestException, Body, Controller, Get, Param, Post, Req, Res, UseGuards } from '@nestjs/common';
import { Response } from 'express';
import { UuidService } from 'nestjs-uuid';
import { StripeService } from 'src/client/payment/stripe.service';
import { BusinessGuard } from 'src/guards/business/business.guard';
import { PersonalGuard } from 'src/guards/personal/personal.guard';
import { ProductsService } from 'src/products/products.service';
import { UsersService } from 'src/users/users.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { OrdersService } from './orders.service';

@Controller('orders')
export class OrdersController {
  constructor(
    private readonly ordersService: OrdersService, 
    private readonly uuidService: UuidService, 
    private readonly usersService: UsersService, 
    private readonly productsService: ProductsService, 
    private readonly stripeService: StripeService,
  ) {}

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
  @Post('payment')
  async createPaymentIntent(@Body() createOrderDto: CreateOrderDto, @Res() res: Response) {
    const total = createOrderDto.sales.reduce((acc, sale) => acc + sale.total, 0);
    //ANTES DE PROCEDER CON EL PAGO, CONFIMRMAMOS QUE EL TOTAL DEL ORDEN ES LA SUMA DE TODOS LOS VENTAS
    if(total !== createOrderDto.total) return new BadRequestException('Something is wrong with the prices...');
    
    const paymentIntent = await this.stripeService.createPaymentIntent(total * 100, 'usd'); 
  
    return res.json( { clientSecret: paymentIntent.client_secret } );
  }

  @UseGuards(PersonalGuard)
  @Post('')
  async create(@Body() createOrderDto: CreateOrderDto, @Res() res: Response) {
    createOrderDto.id = this.uuidService.generate();
    createOrderDto.sales.forEach(sale => sale.orderId = createOrderDto.id);
    //COMPROBAR QUE TODOS LOS PRODUCTOS IGUALES DEL MISMO VENDEDOR VIENEN EN UNA ÚNICA VENTA
    if(this.productSellerDuplicated(createOrderDto.sales)){
      return res.status(400).json(`Order is not valid and haven't been placed`);
    }
    const sales = [];
      for(let sale of createOrderDto.sales) {
        //COMPROBAR VENDEDOR EXISTE
        const seller = await this.usersService.userById({id:Number(sale.sellerId)});
        if(!seller){
          return res.status(404).json('Seller not found')
        }
        //COMPROBAR VENDEDOR TIENE PRODUCTO
        const sellerProducts = await this.productsService.findAll({authorId: Number(sale.sellerId)});
        const product = sellerProducts.products.find(product => product.id == sale.productId);
        if(!product || product.stock == 0 || product.stock < sale.quantity){
          return res.status(404).json(`Product doesn't belong to seller or quantity needed is over stock`);
        }
        //COMPROBAR RELACION PRODUCTO*CANTIDAD = TOTAL_VENTA
        if(sale.quantity * product.price != sale.total ){
          return res.status(400).json('Something is wrong with the prices...')
        }
        sale.productSnapshot = product;
        sale.id = this.uuidService.generate();
        sales.push(sale)
      }

      const order = {id:createOrderDto.id,authorId:createOrderDto.authorId,total:createOrderDto.total}

      return res.json(await this.ordersService.addOrder(order, sales));
  }

  @UseGuards(PersonalGuard)
  @Get('')
  findOrders( @Req() req: Request) {
    return this.ordersService.findOrders({authorId: req['user'].sub});
  }

  @UseGuards(BusinessGuard)
  @Get('sales')
  findSales( @Req() req: Request) {
    return this.ordersService.findSales({sellerId: req['user'].sub});
  }

  @UseGuards(PersonalGuard)
  @Get(':id')
  findOrder(@Param('id') id: string) {
    return this.ordersService.findOrderById({id});
  }

}
