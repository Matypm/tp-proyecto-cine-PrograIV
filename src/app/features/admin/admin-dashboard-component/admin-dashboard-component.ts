import { Component, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { SupabaseService } from '../../../core/services/supabase-service';

@Component({
  imports: [RouterLink],
  selector: 'app-admin-dashboard-component',
  styleUrl: './admin-dashboard-component.css',
  templateUrl: './admin-dashboard-component.html',
})
export class AdminDashboardComponent {
  private supabase = inject(SupabaseService).client;

  cantidadPeliculas = signal(0);
  cantidadUsuarios = signal(0);
  cantidadFunciones = signal(0);
  cantidadEntradas = signal(0);

  constructor() {
    this.cargarMetricas();
  }

  async cargarMetricas() {
    
    const peliculas = await this.supabase
      .from('peliculas')
      .select('*', { count: 'exact', head: true });

    const usuarios = await this.supabase
      .from('usuarios')
      .select('*', { count: 'exact', head: true });

    const funciones = await this.supabase
      .from('funciones')
      .select('*', { count: 'exact', head: true });

    const entradas = await this.supabase
      .from('entradas')
      .select('*', { count: 'exact', head: true });

    this.cantidadPeliculas.set(peliculas.count ?? 0);
    this.cantidadUsuarios.set(usuarios.count ?? 0);
    this.cantidadFunciones.set(funciones.count ?? 0);
    this.cantidadEntradas.set(entradas.count ?? 0);
  }

}
