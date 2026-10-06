import { Component, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { SalaService } from '../../../../core/services/sala-service';

@Component({
  imports: [],
  selector: 'app-distribucion-sala',
  styleUrl: './distribucion-sala.css',
  templateUrl: './distribucion-sala.html',
})
export class DistribucionSala {

  private route = inject(ActivatedRoute);
  salaService = inject(SalaService);

  salaId = '';

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      this.salaId = params.get('id') ?? '';

      if (!this.salaId) {
        console.error('No se encontró el ID de la sala');
        return;
      }

      this.salaService.cargarButacasPorSala(this.salaId);
    });
  }

  filas = [
    'A', 'B', 'C', 'D', 'E',
    'F', 'G', 'H', 'I', 'J',
    'K', 'L', 'M', 'N', 'O',
    'P', 'Q', 'R', 'S', 'T'
  ];

  butacasPorFila(fila: string) {
    return this.salaService.butacas()
      .filter(butaca => butaca.fila === fila)
      .sort((a, b) => a.columna - b.columna);
  }


  esButacaDiscapacidad(fila: string): boolean {
    return fila === 'J' || fila === 'K';
  }


  esVip(fila: string): boolean {
    return fila === 'R' || fila === 'S' || fila === 'T';
  }


}
