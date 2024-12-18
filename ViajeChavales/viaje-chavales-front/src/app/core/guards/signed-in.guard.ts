import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { jwtDecode } from "jwt-decode";
import { LOCAL_STORAGE_ACCESS_KEY } from '../consts/local-storage-key';

export const signedInGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  const accessToken = localStorage.getItem(LOCAL_STORAGE_ACCESS_KEY);
  if(!accessToken){
    router.navigate(['/login']);
    return false;
  }else{
    const tokenDecoded = jwtDecode(accessToken);
    if((tokenDecoded.exp && tokenDecoded.exp * 1000 < Date.now()) || tokenDecoded.aud !== 'VIAJESITOS' || tokenDecoded.iss !== 'Myself'){
      router.navigate(['/login']);
      return false;
    }
    return true;
  }
};
