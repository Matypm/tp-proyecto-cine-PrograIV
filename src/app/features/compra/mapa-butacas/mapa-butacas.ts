import { Component, computed, DestroyRef, inject, signal } from '@angular/core';
import { CompraService } from '../../../core/services/compra-service';
import { FuncionesService } from '../../../core/services/funciones-service';
import { ButacasService } from '../../../core/services/butacas-service';
import { ActivatedRoute, Router } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ButacaInterface } from '../../../core/models/sala.cine.interface';
import { FuncionInterface } from '../../../core/models/funcion.interface';
import { PeliculasInterface } from '../../../core/models/pelicula.interface';
import { PeliculaService } from '../../../core/services/pelicula-service';
import { ResumenCompra } from '../resumen-compra/resumen-compra';

@Component({
  imports: [ResumenCompra],
  selector: 'app-mapa-butacas',
  styleUrl: './mapa-butacas.css',
  templateUrl: './mapa-butacas.html',
})
export class MapaButacas {

  private router = inject(Router); 
  private route = inject(ActivatedRoute);
  private compraService = inject(CompraService);
  private funcionService = inject(FuncionesService);
  private butacasService = inject(ButacasService);
  private destroyRef = inject(DestroyRef);
  private peliculaService = inject(PeliculaService);

  butacasSeleccionadas = this.compraService.butacasSeleccionadas;
  funcion = signal<FuncionInterface | null>(null);
  pelicula = signal<PeliculasInterface | null>(null);

  filas = [ 
    'A', 'B','C', 'D', 'E',
    'F', 'G', 'H', 'I', 'J',
    'K', 'L', 'M', 'N', 'O',
    'P', 'Q', 'R', 'S', 'T'
  ];

  // precioNormal = 10000;
  // precioVip = 17000;


  constructor(){
    this.cargarFuncion();

    // Al destruirse el componente (por ejemplo, al salir de la pantalla),
    // eliminamos el canal Realtime para evitar dejarlo activo. 
    this.destroyRef.onDestroy(() => {
      this.butacasService.detenerRealtime();
    });
    
  }

  // preciodeButaca(butaca: ButacaInterface): number {
  //   if(this.esVip(butaca.fila)){
  //     return this.precioVip;
  //   }

  //   return this.precioNormal;
  // }


  butacasPorFila(fila:string){
    return this.butacasService.butacas()
      //Este filter me va a devolver un array con la fila de butacas de una sola letra
      .filter(butaca => butaca.fila === fila) 
      // Como filter me dio la fila de una sola letra, pueen no estar en orden
      // entonces con el sort ordenamos cada butaca
      .sort((a, b) => a.columna - b.columna);
  }

  esButacaDiscapacidad(fila: string, columna: number): boolean {
    if (fila !== 'J' && fila !== 'K') {
        return false;
    }
    
    return (
        columna === 3 ||
        columna === 4 ||
        (columna >= 5 && columna <= 9) ||
        (columna >= 20 && columna <= 24) ||
        columna === 25 ||
        columna === 26
    );
}

  esVip(fila:string): boolean{
    return this.compraService.esVip(fila);
  }

  seleccionarButaca(butacaId: string): void {

    if(this.butacaOcupada(butacaId)){
      return;
    }
    // va a contener los ids de las q sean elegidas
    const elegidas = this.butacasSeleccionadas(); 

    // preguntamos si un Id en este caso existe dentro del signal
    if(elegidas.includes(butacaId)){
      this.butacasSeleccionadas.set(
        elegidas.filter(id => id != butacaId) // Aca el filter crea un nuevo array sin esa butaca
      );
    } else {
      this.butacasSeleccionadas.set([...elegidas, butacaId]); // la agregamos si no esta en el array de elegidas
    }
  }

  butacaOcupada(butacaId: string): boolean{
    return this.butacasService.butacasOcupadas()
    // El some nos indicara si existe alguna entrada en butacas_funciones 
    // donde el butaca_id sea igual al q pasamos por parametro
      .some(butaca => butaca.butaca_id === butacaId)
  }

  nombreButacaSeleccionada(): ButacaInterface[] {
    return this.butacasService.butacas()
      .filter(butaca => this.butacasSeleccionadas().includes(butaca.id!));
  }
  
  async cargarFuncion(){
    // takeUntilDestroyed() cancela automáticamente la suscripción a paramMap
    // cuando MapaButacas se destruye, evitando dejar suscripciones activas
    // después de salir de la pantalla.
    this.route.paramMap
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe(async params => {
      const funcionId = params.get('funcionId');
      
      if(!funcionId){
        console.error('No hay funcion seleccionada');
        return;
      }
      this.compraService.funcionSeleccionada.set(funcionId);
  
      const funcion = await this.funcionService.obtenerFuncion(funcionId);
      

      if(!funcion){
        return;
      }

      this.funcion.set(funcion);
      console.log('Sala: ', funcion.salas?.nombre)

      const pelicula = this.peliculaService.getPeliculaById(funcion.pelicula_id);
      this.pelicula.set(pelicula()!);

      console.log('Funcion: ', funcion);
      console.log('Sala: ', funcion.sala_id)
  
      await this.butacasService.obtenerButacasSala(funcion.sala_id);
      console.log('Butacas en el service:', this.butacasService.butacas());
      console.log('Primera butaca:', this.butacasService.butacas()[0]);
console.log('Cantidad fila A:', this.butacasPorFila('A').length);

      await this.butacasService.obtenerButacasOcupadas(funcion.id!)
  
      this.butacasService.iniciarRealtime(funcionId);

      console.log('Butacas ocupadas:', this.butacasService.butacasOcupadas());
  
      console.log(
      'Butacas:',
      this.butacasService.butacas()
      );
    })
    
  }
}

