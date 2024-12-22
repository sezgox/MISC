import { Routes } from '@angular/router';
import { ConfirmOrderComponent } from '@components/account/confirm-order/confirm-order.component';
import { DashboardComponent } from '@components/account/dashboard/dashboard.component';
import { OrderComponent } from '@components/account/order/order.component';
import { LoginComponent } from '@components/auth/login/login.component';
import { RegisterComponent } from '@components/auth/register/register.component';
import { ProductViewComponent } from '@components/main/product-view/product-view.component';
import { ProductsComponent } from '@components/main/products/products.component';
import { authGuard } from './core/guards/auth.guard';
import { rolePersonalGuard } from './core/guards/role-personal.guard';

export const routes: Routes = [
    { path:'', redirectTo: 'products', pathMatch: 'full' },
    { path:'register', component: RegisterComponent },
    { path:'login', component: LoginComponent },
    { path:'products',children: [
      { path: '', component: ProductsComponent },
      { path: ':id', component: ProductViewComponent} ,
      { path: '**', redirectTo: '/products' }
    ] },
    { path: 'account', canActivate: [authGuard], children: [
      {path:'', component: DashboardComponent},
      {path:'cart', component:ConfirmOrderComponent, canActivate: [rolePersonalGuard]},
      {path:'order', children:[
        {path:'', redirectTo: '', pathMatch: 'full' },
        {path:':id', component: OrderComponent},
        { path: "**", redirectTo: '' }
      ]},
      {path: "**", redirectTo: '/account' }
    ]},
    { path: "**", redirectTo: 'products' }
];
