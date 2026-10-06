import { Component, inject } from '@angular/core';
import { PeliculaService } from '../../../../core/services/pelicula-service';
import { Router, RouterLink } from '@angular/router';

@Component({
  imports: [RouterLink],
  selector: 'app-gestion-peliculas',
  styleUrl: './gestion-peliculas.css',
  templateUrl: './gestion-peliculas.html',
})
export class GestionPeliculas {
  private router = inject(Router);
  private peliculaService = inject(PeliculaService);

  peliculas = this.peliculaService.peliculas;

  editarPelicula(id: string): void {
    this.router.navigate(['/admin/peliculas/editar', id]);
  }

  async eliminarPelicula(id: string): Promise<void> {

    const confirmar = confirm('¿Estás seguro de que querés eliminar esta película?');

    if (!confirmar) {
      return;
    }

    const eliminada = await this.peliculaService.eliminarPelicula(id);

    if (!eliminada) {
      alert('No se pudo eliminar la película. Verificá si tiene funciones asociadas');
      return;
    }

    alert('Película eliminada correctamente');
  }

  

}
