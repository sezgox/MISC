import { Component, inject, OnInit } from '@angular/core';
import { HeaderComponent } from '@components/shared/header/header.component';
import { NewProduct, Product, ProductQuery } from '@interfaces/products.interfaces';
import { User } from '@interfaces/user.interface';
import { ProductsService } from '@services/products.service';
import { UsersService } from '@services/users.service';
import { jwtDecode } from 'jwt-decode';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [HeaderComponent],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent implements OnInit {

  productsService = inject(ProductsService);
  usersService = inject(UsersService);
  user: User | null;
  products: Product[] = [];
  query: ProductQuery = {
    page: 1,
    pageSize: 5,
  }
  maxPage: number = 0;

  product: NewProduct = {
    name: 'Diablo',
    description: 'The sword of the gods',
    imgUrl: 'https://i.imgur.com/llhkXn8.jpeg',
    stock: 2,
    price: 100,
    categories: ['Sports', 'Beauty'],
  }

  ngOnInit(): void {
    this.user = this.usersService.getCurrentUser();
    const token = localStorage.getItem('AUTH_TOKEN');
    if(token){
      const tokenDecoded = jwtDecode(token);
      this.query.authorId = Number(tokenDecoded.sub);
    }
    this.getProducts();
  }

  getProducts() {
    this.productsService.getProducts(this.query).subscribe({
      next: (res: any) => {
        console.log(res)
        if (res.status != 404) {
          for (let product of res.products) {
            this.products.push(product);
          }
          this.maxPage = Math.ceil(res.totalProducts / this.query.pageSize);
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
        console.log(res);
      },
      error: (err) => {
        console.log(err);
      }
    });
  }

  loadMore(){
    this.query.page++;
    this.getProducts();
  }

}
