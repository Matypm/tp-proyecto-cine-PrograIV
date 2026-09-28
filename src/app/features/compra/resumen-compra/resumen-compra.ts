import { Component, computed, inject, input } from '@angular/core';
import { ButacaInterface } from '../../../core/models/sala.cine.interface';
import { CompraService } from '../../../core/services/compra-service';
import { PeliculasInterface } from '../../../core/models/pelicula.interface';
import { FuncionInterface } from '../../../core/models/funcion.interface';
import { Router } from '@angular/router';
import { ButacasService } from '../../../core/services/butacas-service';

@Component({
  imports: [],
  selector: 'app-resumen-compra',
  styleUrl: './resumen-compra.css',
  templateUrl: './resumen-compra.html',
})
export class ResumenCompra {

  private compraService = inject(CompraService);
  private butacasService = inject(ButacasService);
  private router = inject(Router);

  pelicula = input<PeliculasInterface | null>(null);
  funcion = input<FuncionInterface | null>(null);

  butacasSeleccionadas = computed(() => {
    const ids = this.compraService.butacasSeleccionadas();
    const butacas = this.butacasService.butacas();

    return butacas.filter(butaca => ids.includes(butaca.id!));
  });

  precioDeButaca(butaca: ButacaInterface): number {
    return this.compraService.precioDeButaca(butaca);
  }


  formatearFechaResumenCompra(fecha: string): string {
    const fechaFormateada = new Date(fecha);

    return new Intl.DateTimeFormat('es-AR', {
        weekday: 'long',
        day: '2-digit',
        month: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
    }).format(fechaFormateada).replace('-', '/');
  }

  precioTotal(): number{
    return this.butacasSeleccionadas().reduce((total, butaca) => {
      return total + this.precioDeButaca(butaca);
    }, 0)
  }

  navegarCandybar(){
    this.router.navigate(['/candybar'])
  }

}
