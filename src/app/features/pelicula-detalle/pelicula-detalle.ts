import { Component, computed, effect, inject, input } from '@angular/core';
import { PeliculaService } from '../../core/services/pelicula-service';
import { Router } from '@angular/router';
import { FuncionesService } from '../../core/services/funciones-service';

@Component({
  imports: [],
  selector: 'app-pelicula-detalle',
  styleUrl: './pelicula-detalle.css',
  templateUrl: './pelicula-detalle.html',
})
export class PeliculaDetalle {

  id = input.required<string>();

  private peliculaService = inject(PeliculaService);
  private funcionesService = inject(FuncionesService);
  private router = inject(Router);

  // computed() obtiene la película correspondiente al ID de la ruta.
  // Si las películas del servicio cambian, este computed se actualiza.
  pelicula = computed(() => {
    const todasLasPeliculas = this.peliculaService.peliculas();
    return todasLasPeliculas.find(p => p.id === this.id());
  });

  funciones = computed(() => {
    this.funcionesService.funciones(); // No hace falta q haga lo de abajo pq en la consuta del FuncionesService ya lo filtro
    // return funcionesDePelicula.filter(p => p.pelicula_id === this.id());
  });

  constructor(){
    effect(() => {
      const peliculaId = this.id();
      this.funcionesService.cargarFuncionesPorPelicula(peliculaId);
    });

    effect(() => {
        console.log('Funciones de la película:', this.funciones());
    });
  }

  // Navegación programática — volver al listado
  volver(): void {
    this.router.navigate(['/home']);
  }


}
