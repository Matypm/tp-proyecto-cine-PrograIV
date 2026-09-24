import { Routes } from '@angular/router';
import { Home } from './features/home/home';
import { Login } from './features/auth/login/login';
import { Register } from './features/auth/register/register';
import { authGuard } from './core/guards/auth.guard';
import { authAdminGuard } from './core/guards/auth-admin-guard';

export const routes: Routes = [
    { path: '', redirectTo: '/home', pathMatch: 'full'},

    {
        path: 'home',
        loadComponent: () => import('./features/home/home').then(c => c.Home)
    },
    {
        path: 'home/pelicula/:id',
        loadComponent: () => import('./features/pelicula-detalle/pelicula-detalle').then(c => c.PeliculaDetalle)
    },

    // Rutas para registrarse y loguearse
    {path: 'login', component: Login},
    {path: 'register', component: Register},
];
