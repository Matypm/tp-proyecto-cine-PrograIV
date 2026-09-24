import { Component, computed, effect, inject, signal } from '@angular/core';
import { PeliculaService } from '../../core/services/pelicula-service';
import { Router, RouterOutlet } from '@angular/router';
import { PeliculaCard } from '../../shared/component/pelicula-card/pelicula-card';
import { SearhBar } from '../../shared/component/searh-bar/searh-bar';


@Component({
  imports: [PeliculaCard, SearhBar, RouterOutlet],
  selector: 'app-home',
  styleUrl: './home.css',
  templateUrl: './home.html',
})
export class Home {

  // Injecto dependencias
  private peliculaService = inject(PeliculaService);
  private router = inject(Router);

  //Traigo del servicio las peliculas
  peliculas = this.peliculaService.peliculas;
  generos = this.peliculaService.generos;

  // Estado q muta para el filtro de busqueda
  filtroBusqueda = signal('');
  filtroGenero = signal('');

  // computed() - filtra las pelis segun el termino de la busqueda
  // Se recalcula solo cuando cambia filtroBusqueda o peliculas
  peliculasFiltradas = computed(() => {

    const palabra = this.filtroBusqueda().toLowerCase();
    const genero = this.filtroGenero();
    

    return this.peliculas().filter(pelicula => {

      const filtraNombre = 
        !palabra ||
        pelicula.nombre.toLowerCase().includes(palabra);

      const filtraGenero =
        !genero ||
        pelicula.pelicula_genero.some(pg =>
          pg.genero_id === genero
        );
        // Uso some() porque solo necesito saber si existe AL MENOS un género que coincida con la búsqueda.
        // A diferencia de filter(), que devuelve un nuevo array con las coincidencias,
        // some() devuelve true/false y termina de recorrer cuando encuentra una coincidencia.
      
        return filtraNombre && filtraGenero
      });
  });
    

  constructor(){
    // effect() — ejecuta un efecto secundario cada vez que cambian los signals que lee
    effect(() => {
      console.log(`Filtro activo: "${this.filtroBusqueda()}" -> ${this.peliculasFiltradas().length} resultados`);
    })
  }

  // Navega a la pantalla donde se muestran los datos y funciones de la película
  verFunciones(peliculaId: string): void {
    this.router.navigate(['/home/pelicula', peliculaId]);
}

}
