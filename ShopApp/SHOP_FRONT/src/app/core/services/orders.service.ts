import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { CreateOrder, Order, Sale } from '@interfaces/orders.interfaces';
import { Observable } from 'rxjs';



@Injectable({
  providedIn: 'root'
})
export class OrdersService {

  private http = inject(HttpClient);

  headers = { 'Authorization': `Bearer ${localStorage.getItem('AUTH_TOKEN')}` };


  constructor() { }

  paymentIntent(order: CreateOrder):Observable<string>{
    return this.http.post<string>(`http://localhost:3000/orders/payment`, order, {headers:this.headers});
  }

  completeOrder(order: CreateOrder):Observable<any> {
    return this.http.post(`http://localhost:3000/orders`, order, {headers:this.headers});
  }

  getOrders():Observable<Order[]>{
    return this.http.get<Order[]>(`http://localhost:3000/orders`, {headers:this.headers});
  }

  getSales():Observable<Sale[]>{
    return this.http.get<Sale[]>(`http://localhost:3000/orders/sales`, {headers:this.headers});
  }

  getOrderById(id: string):Observable<Order>{
    return this.http.get<Order>(`http://localhost:3000/orders/${id}`, {headers:this.headers});
  }
}
