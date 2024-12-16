import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { NewProduct, Product, ProductQuery } from '@interfaces/products.interfaces';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ProductsService {

  apiUrl: string = 'http://localhost:3000/products';
  headers = { 'Authorization': `Bearer ${localStorage.getItem('AUTH_TOKEN')}` };

  constructor() { }

  http = inject(HttpClient);

  getProducts(query: ProductQuery): Observable<{products: Product[], totalProducts: number}> {
    const params = Object(query);
    return this.http.get<{products: Product[], totalProducts: number}>(this.apiUrl, {params,headers: this.headers });
  }

  getProductById(productId: number): Observable<Product> {
    return this.http.get<Product>(`${this.apiUrl}/${productId}`, { headers: this.headers });
  }

  addProduct(product: NewProduct): Observable<Product> {
    return this.http.post<Product>(this.apiUrl, product,{ headers: this.headers});
  }

  editProduct(product: Product): Observable<Product> {
    console.log('klk')
    return this.http.patch<Product>(`${this.apiUrl}/${product.id}`, product,{ headers: this.headers});
  }

  deleteProduct(productId: number):Observable<Product>{
    return this.http.delete<Product>(`${this.apiUrl}/${productId}`, { headers: this.headers });
  }

}
