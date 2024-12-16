import { DatePipe } from '@angular/common';
import { Component, inject, Input, OnInit } from '@angular/core';
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
        this.sales = res;
        const productsIds = Array.from(new Set(this.sales.map(sale => sale.productId)));
        for(let productId of productsIds){
          this.productsService.getProductById(productId).subscribe({
            next: (product) => {
              for(let sale of this.sales){
                if(sale.productId == product.id){
                  sale.product = product;
                }
              }
            },
            error: (err) => {
              console.error(err);
            }
          })
        }
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

}
