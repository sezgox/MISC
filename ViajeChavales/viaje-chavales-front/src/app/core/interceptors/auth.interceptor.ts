import { isPlatformBrowser } from '@angular/common';
import { HttpInterceptorFn } from '@angular/common/http';
import { inject, PLATFORM_ID } from '@angular/core';
import { LOCAL_STORAGE_ACCESS_KEY } from '../consts/local-storage-key';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const platformId = inject(PLATFORM_ID);
  if (isPlatformBrowser(platformId)){
    const token = localStorage.getItem(LOCAL_STORAGE_ACCESS_KEY); // Replace with your token key
  if (token) {
    const clonedRequest = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`,
      },
    });
    console.log(clonedRequest)
    return next(clonedRequest);
  }
  return next(req);
  }else{
    return next(req);
  }

};
