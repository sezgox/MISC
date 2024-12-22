import { Component, inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { HeaderComponent } from '@components/shared/header/header.component';
import { ProductTicketComponent } from '@components/shared/product-ticket/product-ticket.component';
import { UserCart } from '@interfaces/cart.interfaces';
import { CreateOrder } from '@interfaces/orders.interfaces';
import { CartService } from '@services/cart.service';
import { OrdersService } from '@services/orders.service';
import { UsersService } from '@services/users.service';
import { loadStripe, Stripe } from '@stripe/stripe-js';

@Component({
  selector: 'app-confirm-order',
  standalone: true,
  imports: [HeaderComponent, ProductTicketComponent],
  templateUrl: './confirm-order.component.html',
  styleUrl: './confirm-order.component.css'
})
export class ConfirmOrderComponent implements OnInit {

  private stripe!: Stripe;
  cardElement: any;
  clientSecret: string = '';

  ordersService = inject(OrdersService);
  cartsService = inject(CartService);
  usersService = inject(UsersService);
  router = inject(Router);

  cart: UserCart;
  order: CreateOrder;


  async ngOnInit() {
    const userId = this.usersService.getCurrentUser().id;
    this.cart = this.cartsService.getUserCart(userId);

    const total = this.cart.products.reduce((acc, product) => acc + product.total, 0);
    this.order = {
      authorId: this.cart.userId,
      total,
      sales: []

    }
    for(let product of this.cart.products){
      const sale = {
        productId: product.id,
        sellerId: product.authorId,
        total: product.total,
        quantity: product.quantity
      }
      this.order.sales.push(sale);
    }
    this.stripe = await loadStripe('pk_test_51QJFn0KkEH5Jw3aBwj3gbdGSjSSS85mk446FLDoTrHQ69keyPcjyzgi4jhulkB73HErCA5MLSsKKkHeBa9eN7OwP00IFFbZduF');
    const elements = this.stripe.elements();
    this.cardElement = elements.create('card',
      {
        style: {
          base: {
            iconColor: 'light-dark(#c4f0ff,#006cff)',
            color: 'light-dark(#f3f3f3, #222222)',
            fontWeight: '500',
            fontFamily: 'Roboto, Open Sans, Segoe UI, sans-serif',
            fontSize: '16px',
            fontSmoothing: 'antialiased',
            ':-webkit-autofill': {
              color: '#fce883',
            },
            '::placeholder': {
              color: '#87BBFD',
            },
          },
          invalid: {
            iconColor: '#FFC7EE',
            color: '#FFC7EE',
          },
        },
      }
    ); // Crear el elemento de tarjeta
    this.cardElement.mount('#card-element'); // Montar en el DOM
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
              this.cartsService.clearCart(this.order.authorId);
              this.router.navigate([`/account/order/${res.id}`]);
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
