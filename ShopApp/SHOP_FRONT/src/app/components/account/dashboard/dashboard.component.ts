import { Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { HeaderComponent } from '@components/shared/header/header.component';
import { NewProduct, Product, ProductQuery } from '@interfaces/products.interfaces';
import { User } from '@interfaces/user.interface';
import { ProductsService } from '@services/products.service';
import { UsersService } from '@services/users.service';
import { CartComponent } from './cart/cart.component';
import { InformationComponent } from './information/information.component';
import { MenuComponent } from './menu/menu.component';
import { OrdersComponent } from './orders/orders.component';
import { ProductsComponent } from './products/products.component';
import { SalesComponent } from './sales/sales.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [HeaderComponent, FormsModule, InformationComponent, ProductsComponent, MenuComponent, CartComponent, OrdersComponent, SalesComponent],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent implements OnInit {

  productsService = inject(ProductsService);
  usersService = inject(UsersService);
  route = inject(ActivatedRoute);
  router = inject(Router);

  user: User | null;
  products: Product[] = [];
  maxPage: number = 0;

  product: NewProduct = {
    name: 'Diablo',
    description: 'The sword of the gods',
    imgUrl: 'https://i.imgur.com/llhkXn8.jpeg',
    stock: 2,
    price: 100,
    categories: ['Sports', 'Beauty'],
  }

  businessOptions: string[] = ['information', 'products', 'sales',];
  personalOptions: string[] = ['information', 'orders', 'cart'];
  menuOption: string = "information";

  ngOnInit(): void {
    this.user = this.usersService.getCurrentUser();

    this.route.queryParams.subscribe(params => {
      console.log(params['menuOption'], this.user.role);
      if(params['menuOption']
        && (this.user.role == 'PERSONAL' && this.personalOptions.includes(params['menuOption']))
        || (this.user.role == 'BUSINESS' && this.businessOptions.includes(params['menuOption']))){
        this.menuOption = params['menuOption'];
      }
    });
  }

  getProducts(query: ProductQuery) {
    this.productsService.getProducts(query).subscribe({
      next: (res: any) => {
        if (res.status != 404) {
          if(query.page == 1 ){
            this.products = [];
          }
          for (let product of res.products) {
            this.products.push(product);
          }
          this.maxPage = Math.ceil(res.totalProducts / query.pageSize);
        } else {
          this.products = [];
          console.log(res.message)
        }
      },
      error: (err) => {
        console.log(err);
      }
    });
  }

  addProduct(product: NewProduct = this.product) {
    this.productsService.addProduct(product).subscribe({
      next: (res) => {
        this.products.push(res)
      },
      error: (err) => {
        console.log(err);
      }
    });
  }

  deleteProduct(id: number) {
    this.productsService.deleteProduct(id).subscribe({
      next: (res) => {
        this.products = this.products.filter(product => product.id != id);
      },
      error: (err) => {
        console.log(err);
      }
    })
  }

  onMenuChange(menuOption: string){
    this.menuOption = menuOption;
    this.router.navigate(['account'], {queryParams: {menuOption: menuOption}});
  }

}
