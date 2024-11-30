import { Component, inject, OnInit } from '@angular/core';
import { Product, ProductQuery } from '@interfaces/products.interfaces';
import { ProductsService } from '@services/products.service';

@Component({
  selector: 'app-products',
  standalone: true,
  imports: [],
  templateUrl: './products.component.html',
  styleUrl: './products.component.css'
})
export class ProductsComponent implements OnInit{

  productsService = inject(ProductsService);

  products: Product[] = [];
  query: ProductQuery = {
    page: 1,
    pageSize: 10
  };

  ngOnInit(): void {
    this.getProducts();
  }

  getProducts(){
    this.productsService.getProducts(this.query).subscribe({
      next:(res)=>{
        console.log(res);
      },
      error:(err)=>{
        console.log(err);
      }
    });
  }

}
