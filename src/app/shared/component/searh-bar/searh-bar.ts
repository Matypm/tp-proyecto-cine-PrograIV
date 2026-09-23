import { Component, input, model } from '@angular/core';
import { GeneroInterface } from '../../../core/models/genero.interface';

@Component({
  imports: [],
  selector: 'app-searh-bar',
  styleUrl: './searh-bar.css',
  templateUrl: './searh-bar.html',
})
export class SearhBar {
  // model() — permite two-way binding entre padre e hijo
  // El padre puede usar [(palabra)]="suSignal" para sincronizar el valor

  palabra = model<string>('');
  genero = model<string>('');

  generos = input<GeneroInterface[]>([]);

  limpiar(): void{
    this.palabra.set('');
    this.genero.set('');
  }
}
