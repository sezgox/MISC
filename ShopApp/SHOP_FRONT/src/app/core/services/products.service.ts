import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { NewProduct, Product, ProductQuery } from '@interfaces/products.interfaces';
import { Response } from '@interfaces/responses.interfaces';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ProductsService {

  apiUrl: string = 'http://localhost:3000/products';
  headers = { 'Authorization': `Bearer ${localStorage.getItem('AUTH_TOKEN')}` };

  constructor() { }

  http = inject(HttpClient);

  getProducts(query: ProductQuery): Observable<Response<{products: Product[], totalProducts: number}>> {
    const params = Object(query);
    return this.http.get<Response<{products: Product[], totalProducts: number}>>(this.apiUrl, {params});
  }

  addProduct(product: NewProduct): Observable<Response<Product>> {
    return this.http.post<Response<Product>>(this.apiUrl, product,{ headers: this.headers});
  }

  deleteProduct(productId: number):Observable<Response<Product>> {
    return this.http.delete<Response<Product>>(`${this.apiUrl}/${productId}`, { headers: this.headers });
  }

}
