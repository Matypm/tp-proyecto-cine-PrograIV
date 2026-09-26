import { Component, inject } from '@angular/core';
import { CompraService } from '../../../core/services/compra-service';
import { FuncionesService } from '../../../core/services/funciones-service';
import { ButacasService } from '../../../core/services/butacas-service';

@Component({
  imports: [],
  selector: 'app-mapa-butacas',
  styleUrl: './mapa-butacas.css',
  templateUrl: './mapa-butacas.html',
})
export class MapaButacas {

  private compraService = inject(CompraService);
  private funcionService = inject(FuncionesService);
  private butacasService = inject(ButacasService);

  constructor(){
    this.cargarFuncion();
    
  }
  
  async cargarFuncion(){
    const funcionId = this.compraService.funcionSeleccionada();

    if(!funcionId){
      console.error('No hay funcion seleccionada');
      return;
    }

    const funcion = await this.funcionService.obtenerFuncion(funcionId);

    if(!funcion){
      return;
    }
    console.log('Funcion: ', funcion);
    console.log('Sala: ', funcion.sala_id)

    await this.butacasService.obtenerButacasSala(funcion.sala_id);

    console.log(
    'Butacas:',
    this.butacasService.butacas()
);
  }
}

