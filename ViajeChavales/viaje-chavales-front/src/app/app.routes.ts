import { Routes } from '@angular/router';
import { FreedaysComponent } from './components/freedays/freedays.component';
import { HomeComponent } from './components/home/home.component';
import { LoginComponent } from './components/login/login.component';
import { TripViewComponent } from './components/trips/trip-view/trip-view.component';
import { TripsComponent } from './components/trips/trips.component';
import { authGuard } from './core/guards/auth';

export const routes: Routes = [
  {path: '', redirectTo: 'login', pathMatch: 'full', },
  {path: 'login', component: LoginComponent, canActivate: [authGuard]},
  {path: 'home', component: HomeComponent, canActivate: [authGuard]},
  {path: 'freedays', component: FreedaysComponent, canActivate: [authGuard]},
  {path: 'trips', canActivate: [authGuard],component: TripsComponent},
  {path: 'trips/:id', component: TripViewComponent, canActivate: [authGuard]},
  {path: '**', redirectTo: 'login'}
];
