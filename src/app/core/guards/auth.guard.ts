import { inject } from "@angular/core";
import { Router, type CanActivateFn } from "@angular/router";
import { AuthService } from "../services/auth-service";

export const authGuard: CanActivateFn = (route, state) => {
    const authService = inject(AuthService);
    const router = inject(Router);

    // Verifico si hay un user logueado en el Signal
    const user = authService.currentUser();

    if(user){
        return true;
    }

    // Si no hay sesion, redirigimos al login
    return router.createUrlTree(['/login']);
}