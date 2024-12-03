import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Product, ProductQuery } from '@interfaces/products.interfaces';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ProductsService {

  apiUrl: string = 'http://localhost:3000/products';

  constructor() { }

  http = inject(HttpClient);

  getProducts(query: ProductQuery): Observable<Product[]> {
    const params = Object(query);
    return this.http.get<Product[]>(this.apiUrl, {params});
  }
}
