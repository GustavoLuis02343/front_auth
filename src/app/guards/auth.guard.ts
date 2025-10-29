import { CanActivateFn } from '@angular/router';

export const AuthGuard: CanActivateFn = (route, state) => {
  const token = localStorage.getItem('token');
  return !!token; // true si existe token, false si no
};
