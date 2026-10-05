import { Component, inject } from '@angular/core';
import { PeliculaService } from '../../../../core/services/pelicula-service';
import { RouterLink } from '@angular/router';

@Component({
  imports: [RouterLink],
  selector: 'app-gestion-peliculas',
  styleUrl: './gestion-peliculas.css',
  templateUrl: './gestion-peliculas.html',
})
export class GestionPeliculas {
    private peliculaService = inject(PeliculaService);

    peliculas = this.peliculaService.peliculas;


}
