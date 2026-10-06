import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth-service';

export const AdminGuard: CanActivateFn = (route, state) => {
    const authService = inject(AuthService);
    const router = inject(Router);

    const user = authService.currentPerfil();

    if(user?.rol === 'admin'){
        return true;
    }

    return router.createUrlTree(['/home']);
};