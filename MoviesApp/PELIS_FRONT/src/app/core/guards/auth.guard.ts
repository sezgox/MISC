import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const isAuth = authService.isAuth();
  const router: Router = new Router();
  if(!isAuth){
    router.navigate(['/login']);
  }
  return isAuth;
};
