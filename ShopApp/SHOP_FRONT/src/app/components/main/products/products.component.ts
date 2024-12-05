import { NgClass } from '@angular/common';
import { Component, inject, OnInit, signal, WritableSignal } from '@angular/core';
import { HeaderComponent } from '@components/shared/header/header.component';
import { Product, ProductQuery } from '@interfaces/products.interfaces';
import { ProductsService } from '@services/products.service';
import { UsersService } from '@services/users.service';
import { Categories } from '../../../core/consts/categories.enum';
import { CardProductComponent } from '../card-product/card-product.component';
import { CartComponent } from '../cart/cart.component';

@Component({
  selector: 'app-products',
  standalone: true,
  imports: [CardProductComponent, HeaderComponent, NgClass, CartComponent],
  templateUrl: './products.component.html',
  styleUrl: './products.component.css'
})
export class ProductsComponent implements OnInit{

  productsService = inject(ProductsService);ç
  usersService = inject(UsersService);

  products: Product[] = [];
  query: ProductQuery = {
    page: 1,
    pageSize: 12,
    category: ''
  };
  maxPage: WritableSignal<number> = signal(0);

  Categories = Categories;

  ngOnInit(): void {
    this.getProducts();
  }

  getProducts(){
    this.productsService.getProducts(this.query).subscribe({
      next:(res: any)=>{
        console.log( res)
        if(res.status != 404){
          for(let product of res.products){
            this.products.push(product);
          }
          this.maxPage.set(Math.ceil(res.totalProducts / this.query.pageSize));
          console.log(this.maxPage())
        }else{
          this.maxPage.set(0);
          console.log(res.message)
        }
      },
      error:(err)=>{
        console.log(err);
      }
    });
  }

  filterProducts(cat: string){
    this.query.category = cat == 'all' ? '' : cat;
    this.products = [];
    this.query.page = 1;
    this.getProducts();
  }

  loadMore(){
    this.query.page++;
    this.getProducts();
  }

}
