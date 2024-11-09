import { Routes } from '@angular/router';
import { ConfirmOrderComponent } from './account/confirm-order/confirm-order.component';
import { LoginComponent } from './login/login.component';
import { RegisterComponent } from './register/register.component';

export const routes: Routes = [
    {path:'', redirectTo: 'login', pathMatch: 'full'},
    {path:'register', component: RegisterComponent},
    {path:'login', component: LoginComponent},
    {path:'account/cart', component:ConfirmOrderComponent},
    {path: "**", redirectTo: "login"}
];
