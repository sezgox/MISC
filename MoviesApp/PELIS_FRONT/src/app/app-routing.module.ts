import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './components/AUTH/login/login.component';
import { RegisterComponent } from './components/AUTH/register/register.component';
import { MovieComponent } from "./components/MAIN/movie/movie.component";
import { MoviesComponent } from './components/MAIN/movies/movies.component';
import { authGuard } from './core/guards/auth.guard';
/*  */
const routes: Routes = [
  { path: '', redirectTo: 'movies', pathMatch: 'full'},
  { path: 'movies', canActivate: [authGuard] ,children: [
    { path: '', redirectTo: 'discover/all/1', pathMatch: 'full'},
    { path: 'discover/:genre/:page', component: MoviesComponent },
    { path: 'movie/:id', component: MovieComponent},
    {path: 'search/:title/:page', component: MoviesComponent},
    { path: '**', redirectTo: 'discover/all/1', pathMatch: 'full' }
  ]},
  {path: 'login', component: LoginComponent},
  {path: 'register', component: RegisterComponent},
  { path: '**', redirectTo: 'movies', pathMatch: 'full' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes,{onSameUrlNavigation: 'reload'})],
  exports: [RouterModule]
})
export class AppRoutingModule { }
