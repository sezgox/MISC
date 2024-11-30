import { Routes } from '@angular/router';
import { LoginComponent } from '@components/auth/login/login.component';
import { RegisterComponent } from '@components/auth/register/register.component';
import { ProductsComponent } from '@components/main/products/products.component';
import { ConfirmOrderComponent } from './account/confirm-order/confirm-order.component';

export const routes: Routes = [
    {path:'', redirectTo: 'login', pathMatch: 'full'},
    {path:'register', component: RegisterComponent},
    {path:'login', component: LoginComponent},
    {path:'products', children:[
      {path:'', component: ProductsComponent},
    ]},
    {path:'account/cart', component:ConfirmOrderComponent},
    {path: "**", redirectTo: "login"}
];
