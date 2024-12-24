import { Routes } from '@angular/router';
import { FreedaysComponent } from './components/freedays/freedays.component';
import { HomeComponent } from './components/home/home.component';
import { LoginComponent } from './components/login/login.component';
import { signedInGuard } from './core/guards/signed-in.guard';

export const routes: Routes = [
  {path: '', redirectTo: 'login', pathMatch: 'full'},
  {path: 'login', component: LoginComponent},
  {path: 'home', component: HomeComponent, canActivate: [signedInGuard]},
  {path: 'freedays', component: FreedaysComponent, canActivate: [signedInGuard]},
  {path: '**', redirectTo: 'login'}
];
