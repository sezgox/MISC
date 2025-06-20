import { isPlatformBrowser } from '@angular/common';
import { inject, PLATFORM_ID } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { jwtDecode } from "jwt-decode";
import { ToastrService } from 'ngx-toastr';
import { LOCAL_STORAGE_KEYS } from '../consts/local-storage-key';
import { UsersService } from './../services/users.service';

export const authGuard: CanActivateFn = (route, state) => {
  const platformId = inject(PLATFORM_ID);
  const usersService = inject(UsersService);

  if (isPlatformBrowser(platformId)){
    const router = inject(Router);
    const toastr = inject(ToastrService);
    const accessToken = localStorage.getItem(LOCAL_STORAGE_KEYS.ACCESS);

    if (state.url === '/login' || state.url.startsWith('/register?') || state.url === '/register') {
      if (accessToken) {
        const tokenDecoded = jwtDecode(accessToken);
        if (
          tokenDecoded.exp && tokenDecoded.exp * 1000 > Date.now() &&
          tokenDecoded.aud === 'VIAJESITOS' &&
          tokenDecoded.iss === 'Myself'
        ) {
          toastr.info('Para acceder al login, primero debes cerrar sesión');
          router.navigate(['/home']);
          usersService.loggedIn.emit(false);
          return false;
        }
      }
      usersService.loggedIn.emit(false);
      return true;
    }

    if (!accessToken) {
      router.navigate(['/login']);
      toastr.info('Inicia sesión para acceder a la página.');
      usersService.loggedIn.emit(false);
      return false;
    } else {
      const tokenDecoded = jwtDecode(accessToken);
      if (
        tokenDecoded.exp && tokenDecoded.exp * 1000 < Date.now() ||
        tokenDecoded.aud !== 'VIAJESITOS' ||
        tokenDecoded.iss !== 'Myself'
      ) {
        toastr.info('Sesión caducada, vuelve a iniciar sesión.');
        router.navigate(['/login']);
        usersService.loggedIn.emit(false);
        return false;
      }
      usersService.loggedIn.emit(true);
      return true;
    }
  }else{
    usersService.loggedIn.emit(true);
    return true;
  }

};

