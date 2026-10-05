import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth-service';

export const AdminGuard: CanActivateFn = (route, state) => {
    const authService = inject(AuthService);
    const router = inject(Router);

    const user = authService.currentPerfil();

    console.log('--- ADMIN GUARD ---');
    console.log('Ruta:', state.url);
    console.log('Perfil actual:', user);
    console.log('Rol:', user?.rol);

    if(user?.rol === 'admin'){
        console.log('✅ GUARD: es admin');
        return true;
    }

    console.log('❌ GUARD: NO es admin');
    return router.createUrlTree(['/home']);
};