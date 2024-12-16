import { NgClass } from '@angular/common';
import { Component, inject, OnInit, signal, WritableSignal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HeaderComponent } from '@components/shared/header/header.component';
import { Product, ProductQuery } from '@interfaces/products.interfaces';
import { ProductsService } from '@services/products.service';
import { UsersService } from '@services/users.service';
import { Categories } from '../../../core/consts/categories.enum';
import { CardProductComponent } from '../card-product/card-product.component';

@Component({
  selector: 'app-products',
  standalone: true,
  imports: [CardProductComponent, HeaderComponent, NgClass],
  templateUrl: './products.component.html',
  styleUrl: './products.component.css'
})
export class ProductsComponent implements OnInit{

  productsService = inject(ProductsService);
  usersService = inject(UsersService);
  router = inject(Router);
  route = inject(ActivatedRoute);

  products: Product[] = [];
  query: ProductQuery = {
    page: 1,
    pageSize: 12,
    category: '',
    onlyAvailable: true
  };
  maxPage: WritableSignal<number> = signal(0);
  role: string = '';
  signedIn: boolean = false;

  Categories = Categories;

  ngOnInit(): void {
    if(localStorage.getItem('AUTH_TOKEN')){
      this.signedIn = true;
      this.role = this.usersService.getCurrentUser().role;
    }
    this.route.queryParams.subscribe(params => {
      if(params['menuOption'] && this.Categories.includes(params['category'])){
        this.query.category = params['category'];
      }
    });
    this.getProducts();
  }

  getProducts(){
    this.productsService.getProducts(this.query).subscribe({
      next:(res: any)=>{
          for(let product of res.products){
            this.products.push(product);
          }
          this.maxPage.set(Math.ceil(res.totalProducts / this.query.pageSize));
      },
      error:(err)=>{
        console.error(err);
      }
    });
  }

  filterProducts(cat: string){
    this.query.category = cat == 'all' ? '' : cat;
    this.products = [];
    this.query.page = 1;
    this.router.navigate(['products'], {queryParams: {category: cat}});
    this.getProducts();
  }

  loadMore(){
    this.query.page++;
    this.getProducts();
  }

}
