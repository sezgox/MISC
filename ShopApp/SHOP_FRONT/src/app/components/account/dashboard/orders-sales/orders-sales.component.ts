import { DatePipe } from '@angular/common';
import { Component, inject, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Order, Sale } from '@interfaces/orders.interfaces';
import { OrdersService } from '@services/orders.service';
import { ProductsService } from '@services/products.service';
import { AccountType } from 'src/app/core/consts/user-role.enum';

@Component({
  selector: 'app-orders-sales',
  standalone: true,
  imports: [DatePipe],
  templateUrl: './orders-sales.component.html',
  styleUrl: './orders-sales.component.css'
})
export class OrdersSalesComponent implements OnInit {

  @Input() userType: string;

  accountTypes = AccountType;

  ordersService = inject(OrdersService);
  productsService = inject(ProductsService);
  router = inject(Router);

  orders: Order[] = [];
  sales: Sale[] = [];


  ngOnInit(): void {
    if(this.userType == this.accountTypes.Business) {
      this.getSales();
    }else if(this.userType == this.accountTypes.Personal){
      this.getOrders();
    }
  }

  getSales(){
    this.ordersService.getSales().subscribe({
      next: (res) => {
        console.log(res)
        this.sales = res;
      },
      error: (err) => {
        console.error(err);
      }
    })
  }

  getOrders(){
    this.ordersService.getOrders().subscribe({
      next: (res) => {
        console.log(res)
        this.orders = res;
      },
      error: (err) => {
        console.error(err);
      }
    })
  }

  seeOrderDetails(orderId: number){
    this.router.navigate(['/account/order', orderId]);
  }

}
