import { isPlatformBrowser } from '@angular/common';
import { inject, PLATFORM_ID } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { JwtPayload, jwtDecode } from 'jwt-decode';
import { ToastrService } from 'ngx-toastr';
import { LOCAL_STORAGE_KEYS } from '../consts/local-storage-key';
import { UsersService } from './../services/users.service';

function isTokenValid(accessToken: string | null): boolean {
  if (!accessToken) {
    return false;
  }

  try {
    const tokenDecoded = jwtDecode<JwtPayload>(accessToken);
    return Boolean(tokenDecoded.exp && tokenDecoded.exp * 1000 > Date.now());
  } catch {
    return false;
  }
}

export const authGuard: CanActivateFn = (route, state) => {
  const platformId = inject(PLATFORM_ID);
  const usersService = inject(UsersService);

  if (!isPlatformBrowser(platformId)) {
    usersService.loggedIn.emit(true);
    return true;
  }

  const router = inject(Router);
  const toastr = inject(ToastrService);
  const accessToken = localStorage.getItem(LOCAL_STORAGE_KEYS.ACCESS);
  const isAuthenticated = isTokenValid(accessToken);
  const isPublicRoute = state.url === '/login' || state.url === '/register' || state.url.startsWith('/register?');

  if (isPublicRoute) {
    if (isAuthenticated) {
      toastr.info('Para acceder al login, primero debes cerrar sesión');
      router.navigate(['/home']);
      usersService.loggedIn.emit(true);
      return false;
    }

    usersService.loggedIn.emit(false);
    return true;
  }

  if (!isAuthenticated) {
    toastr.info(accessToken ? 'Sesión caducada, vuelve a iniciar sesión.' : 'Inicia sesión para acceder a la página.');
    router.navigate(['/login']);
    usersService.loggedIn.emit(false);
    return false;
  }

  usersService.loggedIn.emit(true);
  return true;
};
