import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Product, ProductQuery } from '@interfaces/products.interfaces';
import { Observable } from 'rxjs';



/*   id        Int      @default(autoincrement()) @id
  name     String
  description   String?
  imgUrl   String?
  stock    Int
  price    Float
  categories String[]
  authorId  Int?
  createdAt  DateTime   @default(now())
  updatedAt  DateTime   @updatedAt */

@Injectable({
  providedIn: 'root'
})
export class ProductsService {

  constructor() { }

  http = inject(HttpClient);

  getProducts(query: ProductQuery): Observable<Product[]> {
    const params = new HttpParams();
    for(const key in query) {
      if(query[key]) {
        params.append(key, query[key]);
      }
    }
    return this.http.get<Product[]>('http://localhost:3000/products', {params});
  }
}
