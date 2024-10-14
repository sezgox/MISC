import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
    { path: '', pathMatch: 'full', redirectTo: 'portfolio'},
    { path: 'portfolio', loadComponent: () => import('./public/home/home.component').then(m => m.HomeComponent)},
    { path: 'portfolio/projects/:project', loadComponent: () => import('./public/project/project.component').then(m => m.ProjectComponent) },
    { path: 'admin', children: [
      { path: '', loadComponent: () => import('./admin/login/login.component').then(m => m.LoginComponent) },
      { path: 'backoffice', canActivate: [authGuard], children: [
        { path: '', loadComponent: () => import('./admin/backoffice/backoffice.component').then(m => m.BackofficeComponent) },
        { path: 'new', loadComponent: () => import('./admin/backoffice/new-project/new-project.component').then(m => m.NewProjectComponent)  },
        { path: 'edit/:project', loadComponent: () => import('./admin/backoffice/edit-project/edit-project.component').then(m => m.EditProjectComponent)  },
      ]}
    ] },
    { path: '**', pathMatch: 'full', redirectTo: 'portfolio' }
  ];