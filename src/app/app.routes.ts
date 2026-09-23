import { Routes } from '@angular/router';
import { Home } from './features/home/home';
import { Login } from './features/auth/login/login';
import { Register } from './features/auth/register/register';

export const routes: Routes = [
    { path: '', redirectTo: '/home', pathMatch: 'full'},

    {
        path: 'home',
        component: Home
    },

    // Rutas para registrarse y loguearse
    {path: 'login', component: Login},
    {path: 'register', component: Register},
];
