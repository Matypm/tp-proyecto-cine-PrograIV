import { inject } from "@angular/core"
import { CanActivateFn, Router } from "@angular/router" 
import { AuthService } from "../services/auth-service"



export const AdminGuard: CanActivateFn = (route, state) => {
    const authService = inject(AuthService);
    const router = inject(Router);

    // Ver si hay un usuario logueado en el signal
    const user = authService.currentPerfil();

    if(user?.rol === "admin"){
        return true;
    }
    console.log("Debes tener rol admin para acceder a la ruta");

    // Si no hay sesion, mandamos al login
    return router.createUrlTree(['/home']);
} 