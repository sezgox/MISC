import { HttpInterceptorFn } from '@angular/common/http';
import { LOCAL_STORAGE_KEYS } from '../consts/local-storage-key';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  if (typeof window !== 'undefined' && localStorage){
    const token = localStorage.getItem(LOCAL_STORAGE_KEYS.ACCESS); // Replace with your token key
  if (token) {
    const clonedRequest = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`,
      },
    });
    return next(clonedRequest);
  }
  return next(req);
  }else{
    return next(req);
  }

};
