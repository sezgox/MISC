import { HttpInterceptorFn } from '@angular/common/http';
import { LOCAL_STORAGE_ACCESS_KEY } from '../consts/local-storage-key';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const token = localStorage.getItem(LOCAL_STORAGE_ACCESS_KEY); // Replace with your token key
  if (token) {
    const clonedRequest = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`,
      },
    });
    return next(clonedRequest);
  }
  return next(req);
};
