import { DatePipe } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HeaderComponent } from '@components/shared/header/header.component';
import { ProductTicketComponent } from '@components/shared/product-ticket/product-ticket.component';
import { Order } from '@interfaces/orders.interfaces';
import { OrdersService } from '@services/orders.service';

@Component({
  selector: 'app-order',
  standalone: true,
  imports: [HeaderComponent, DatePipe, ProductTicketComponent],
  templateUrl: './order.component.html',
  styleUrl: './order.component.css'
})
export class OrderComponent implements OnInit {

  ordersService = inject(OrdersService);
  route = inject(ActivatedRoute);
  router = inject(Router);

  order: Order;

  ngOnInit(): void {
    this.route.params.subscribe((params: any) => {
      this.ordersService.getOrderById(params.id).subscribe({
        next: (res) => {
          console.log(res)
          this.order = res;
        },
        error: (err) => {
          console.error(err)
        }
      })
    });
  }


}
