import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { UsersService } from '@services/users.service';

export const rolePersonalGuard: CanActivateFn = (route, state) => {
  const userService = inject(UsersService);
  const router = inject(Router);
  const userRole = userService.getCurrentUser().role;
  if(userRole != 'PERSONAL'){
    router.navigate(['account']);
    return false;
  }
  return true;
};
