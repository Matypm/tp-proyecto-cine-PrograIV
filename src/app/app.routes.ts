import { Routes } from '@angular/router';
import { Home } from './features/home/home';
import { Login } from './features/auth/login/login';
import { Register } from './features/auth/register/register';
import { authGuard } from './core/guards/auth.guard';
import { AdminGuard } from './core/guards/admin-guard';
import { MapaButacas } from './features/compra/mapa-butacas/mapa-butacas';

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
    {path: 'login',
        loadComponent: () => import('./features/auth/login/login').then(c => c.Login)
    },
    {path: 'register',
        loadComponent: () => import('./features/auth/register/register').then(c => c.Register)
    },
    {
    path: 'compra/:funcionId',
        loadComponent: () => import('./features/compra/mapa-butacas/mapa-butacas').then(c => c.MapaButacas)
    }
];
