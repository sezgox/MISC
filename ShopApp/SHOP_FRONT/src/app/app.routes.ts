import { Routes } from '@angular/router';
import { ConfirmOrderComponent } from '@components/account/confirm-order/confirm-order.component';
import { DashboardComponent } from '@components/account/dashboard/dashboard.component';
import { LoginComponent } from '@components/auth/login/login.component';
import { RegisterComponent } from '@components/auth/register/register.component';
import { ProductsComponent } from '@components/main/products/products.component';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
    {path:'', redirectTo: 'products', pathMatch: 'full'},
    {path:'register', component: RegisterComponent},
    {path:'login', component: LoginComponent},
    {path:'products', children:[
      {path:'', component: ProductsComponent},
    ]},
    { path: 'account', canActivate: [authGuard], children: [
      {path:'', component: DashboardComponent},
      {path:'cart', component:ConfirmOrderComponent},
    ]},
    {path: "**", redirectTo: 'products'}
];
