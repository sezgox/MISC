import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

export interface Order {
  authorId: number;
  total: number;
  sales: Sale[];
}

export interface Sale {
  productId: number;
  sellerId: number;
  total: number;
  quantity: number;
}

@Injectable({
  providedIn: 'root'
})
export class OrdersService {

  private http = inject(HttpClient);

  headers = { 'Authorization': `Bearer ${localStorage.getItem('AUTH_TOKEN')}` };


  constructor() { }

  paymentIntent(order: Order):Observable<string>{
    return this.http.post<string>(`http://localhost:3000/orders/payment`, order, {headers:this.headers});
  }

  completeOrder(order: Order):Observable<any> {
    
    return this.http.post(`http://localhost:3000/orders`, order, {headers:this.headers});
  }
}
