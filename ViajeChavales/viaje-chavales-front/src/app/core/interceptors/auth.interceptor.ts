import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { LOCAL_STORAGE_KEYS } from '../consts/local-storage-key';
import { ActiveGroupService } from '../services/active-group.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  if (typeof window === 'undefined' || !localStorage) {
    return next(req);
  }

  const activeGroupService = inject(ActiveGroupService);
  const token = localStorage.getItem(LOCAL_STORAGE_KEYS.ACCESS);
  const activeGroupId =
    activeGroupService.getActiveGroupId() ?? localStorage.getItem(LOCAL_STORAGE_KEYS.GROUP_DATA);

  const headers: Record<string, string> = {};
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  if (activeGroupId) {
    headers['X-Group-Id'] = activeGroupId;
  }

  if (Object.keys(headers).length === 0) {
    return next(req);
  }

  return next(
    req.clone({
      setHeaders: headers,
    }),
  );
};
