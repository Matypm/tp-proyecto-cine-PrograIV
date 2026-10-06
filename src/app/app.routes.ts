import { Routes } from '@angular/router';
import { InformacionEntrada } from './features/compra/informacion-entrada/informacion-entrada';
import { AdminGuard } from './core/guards/admin-guard';

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
    },
    {
        path: 'candybar/:funcionId',
        loadComponent: () => import('./features/compra/candybar/candybar').then(c => c.Candybar)
    },
    {
        path: 'pago/:funcionId',
        loadComponent: () => import('./features/compra/pago/pago').then(c => c.Pago)
    },
    {
        path: 'confirmacion/:compraId',
        loadComponent: () => import('./features/compra/informacion-entrada/informacion-entrada').then(c => InformacionEntrada)
    },
    {path: 'perfil',
        loadComponent: () => import('./features/perfil/perfil-component/perfil-component').then(c => c.PerfilComponent)
    },

    // RUTAS ADMIN
    {
        path: 'admin',
        canActivate: [AdminGuard],
        loadComponent: () => import('./features/admin/admin-dashboard-component/admin-dashboard-component').then(c => c.AdminDashboardComponent)
    },

    // Peliculas Admin
    {
        path: 'admin/peliculas',
        canActivate: [AdminGuard],
        loadComponent: () => import('./features/admin/peliculas/gestion-peliculas/gestion-peliculas').then(c => c.GestionPeliculas)
    },
    {
        path: 'admin/peliculas/crear',
        canActivate: [AdminGuard],
        loadComponent: () => import('./features/admin/peliculas/crear-pelicula/crear-pelicula').then(c => c.CrearPelicula)
    },
    {
        path: 'admin/peliculas/editar/:id',
        canActivate: [AdminGuard],
        loadComponent: () => import('./features/admin/peliculas/editar-pelicula-component/editar-pelicula-component').then(c => c.EditarPeliculaComponent)
    },
    // Salas admin
    {
        path: 'admin/salas',
        canActivate: [AdminGuard],
        loadComponent: () => import('./features/admin/salas/salas-gestion-component/salas-gestion-component').then(c => c.SalasGestionComponent)
    },
    {
        path: 'admin/salas/distribucion/:id',
        canActivate: [AdminGuard],
        loadComponent: () => import('./features/admin/salas/distribucion-sala/distribucion-sala').then(c => c.DistribucionSala)
    },

    // Funciones admin
    {
        path: 'admin/funciones',
        canActivate: [AdminGuard],
        loadComponent: () => import('./features/admin/funciones/gestion-funciones-component/gestion-funciones-component').then(c => c.GestionFuncionesComponent)
    },

    // Candybar admin
    {
        path: 'admin/candybar',
        canActivate: [AdminGuard],
        loadComponent: () => import('./features/admin/candy-bar/gestion-candybar/gestion-candybar').then(c => c.GestionCandybar)
    }
];
