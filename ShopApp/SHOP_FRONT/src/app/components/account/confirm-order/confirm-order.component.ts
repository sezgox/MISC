import { Component, inject, OnInit } from '@angular/core';
import { CreateOrder } from '@interfaces/orders.interfaces';
import { OrdersService } from '@services/orders.service';
import { loadStripe, Stripe } from '@stripe/stripe-js';
import { jwtDecode } from 'jwt-decode';

@Component({
  selector: 'app-confirm-order',
  standalone: true,
  imports: [],
  templateUrl: './confirm-order.component.html',
  styleUrl: './confirm-order.component.css'
})
export class ConfirmOrderComponent implements OnInit {

  private stripe!: Stripe;
  cardElement: any;
  clientSecret: string = '';

  ordersService = inject(OrdersService);

//  TODO:CAMBIAR SALES -> PRODUCTS
  order: CreateOrder = {
    authorId:1,
    total:500,
    sales:[{
      productId:1,
      sellerId:1,
      total:500,
      quantity:2
    },
  ]
  }

  async ngOnInit() {

    this.stripe = await loadStripe('pk_test_51QJFn0KkEH5Jw3aBwj3gbdGSjSSS85mk446FLDoTrHQ69keyPcjyzgi4jhulkB73HErCA5MLSsKKkHeBa9eN7OwP00IFFbZduF');
    const elements = this.stripe.elements();
    this.cardElement = elements.create('card'); // Crear el elemento de tarjeta
    this.cardElement.mount('#card-element'); // Montar en el DOM
    const token  = localStorage.getItem('AUTH_TOKEN');
    const tokenDecoded = jwtDecode(token);
    this.order.authorId = Number(tokenDecoded.sub);
  }


  completeOrder(){

    this.ordersService.paymentIntent(this.order).subscribe({
      next: async (res:any) => {
        console.log("Payment Intent Created");
        this.clientSecret = res.clientSecret;

        const { paymentIntent, error } = await this.stripe.confirmCardPayment(this.clientSecret, {
          payment_method: {
            card: this.cardElement,
          },
        });
        if (error) {
          console.error('Payment failed:', error.message);
        } else if (paymentIntent && paymentIntent.status === 'succeeded'){
          this.ordersService.completeOrder(this.order).subscribe({
            next:(res)=>{
              console.log("Order Completed");
              console.log(res);
            },
            error:(err)=>{
              console.log("Error");
              console.log(err);
            }
          });
        }
      },
      error:(err)=>{
        console.log("Error");
        console.log(err);
      }
    });
  }

}
