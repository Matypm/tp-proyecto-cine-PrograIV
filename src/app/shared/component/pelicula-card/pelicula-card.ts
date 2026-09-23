import { Component, input, output } from '@angular/core';
import { PeliculaGenerosInterface } from '../../../core/models/peliculas_generos.interface';

@Component({
  imports: [],
  selector: 'app-pelicula-card',
  styleUrl: './pelicula-card.css',
  templateUrl: './pelicula-card.html',
})
export class PeliculaCard {

  // Recibe la peli desde el Home
  pelicula = input.required<PeliculaGenerosInterface>();

  // Output q avisa al Home cuando se clickea
  seleccionada = output<string>();

  verPelicula(): void {
    this.seleccionada.emit(this.pelicula().id!)
  }

  formatearDuracion(minutos: number): string{
    // el Math.floor() es para redondear para abajo un num si tiene decimales y q quede el numero entero
    const horas = Math.floor(minutos / 60); 
    const minsRestantes = minutos % 60;
    
    return `${horas}h ${minsRestantes}m`;
  }
}
