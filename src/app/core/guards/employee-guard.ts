import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth-service';

export const EmployeeGuard: CanActivateFn = async () => {

    const authService = inject(AuthService);
    const router = inject(Router);

    await authService.esperarInicializacion();

    const perfil = authService.currentPerfil();

    if (perfil?.rol === 'empleado') {
        return true;
    }

    return router.createUrlTree(['/home']);
};