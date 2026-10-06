import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth-service';

export const EmployeeGuard: CanActivateFn = () => {

  const authService = inject(AuthService);
  const router = inject(Router);

  const perfil = authService.currentPerfil();

  if (perfil?.rol === 'empleado') {
    return true;
  }

  router.navigate(['/home']);
  return false;
};