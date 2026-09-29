import { Component, computed, inject, signal } from '@angular/core';
import { CompraService } from '../../../core/services/compra-service';
import { FuncionesService } from '../../../core/services/funciones-service';
import { PeliculaService } from '../../../core/services/pelicula-service';
import { FuncionInterface } from '../../../core/models/funcion.interface';
import { PeliculasInterface } from '../../../core/models/pelicula.interface';
import { ResumenCompra } from '../resumen-compra/resumen-compra';
import { AuthService } from '../../../core/services/auth-service';
import { FormBuilder, Validators, ɵInternalFormsSharedModule, ReactiveFormsModule } from '@angular/forms';
import { validate } from '@angular/forms/signals';
import { ButacasService } from '../../../core/services/butacas-service';

@Component({
  imports: [ResumenCompra, ɵInternalFormsSharedModule, ReactiveFormsModule],
  selector: 'app-pago',
  styleUrl: './pago.css',
  templateUrl: './pago.html',
})
export class Pago {

  private authService = inject(AuthService);
  private compraService = inject(CompraService);
  private funcionService = inject(FuncionesService);
  private peliculaService = inject(PeliculaService);
  private butacasService = inject(ButacasService);
  private fb = inject(FormBuilder);

  funcion = signal<FuncionInterface | null>(null);
  peliculaId = signal<string | null>(null);
  pelicula = computed(() => {
    const id = this.peliculaId();

    if(!id){
      return null;    
    }

    return this.peliculaService.getPeliculaById(id);
  })

  currentPerfil = this.authService.currentPerfil;
  currentUser = this.authService.currentUser;

  formCliente = this.fb.group({
    nombre: ['', Validators.required],
    apellido: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]]
  });

  constructor(){
    this.cargarFuncion();
  }

  async cargarFuncion(){

    const funcionId = this.compraService.funcionSeleccionada();

    if(!funcionId){
      console.error('No hay función seleccionada');
      return;
    }

    const funcion = await this.funcionService.obtenerFuncion(funcionId);

    if(!funcion){
      return;
    }

    this.funcion.set(funcion);

    await this.butacasService.obtenerButacasSala(funcion.sala_id);

    const pelicula = this.peliculaService.getPeliculaById(funcion.pelicula_id);

    this.peliculaId.set(funcion.pelicula_id);
  }
}
