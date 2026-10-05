import { Component, computed, inject, input, signal } from '@angular/core';
import { CompraService } from '../../../core/services/compra-service';
import { FuncionesService } from '../../../core/services/funciones-service';
import { PeliculaService } from '../../../core/services/pelicula-service';
import { FuncionInterface } from '../../../core/models/funcion.interface';
import { ResumenCompra } from '../resumen-compra/resumen-compra';
import { AuthService } from '../../../core/services/auth-service';
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { ButacasService } from '../../../core/services/butacas-service';
import { DatosClienteAnonimoInteface } from '../../../core/models/datos-cliente-anonimo.interface';
import { Router } from '@angular/router';


@Component({
  imports: [ResumenCompra, ReactiveFormsModule],
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
  private router = inject(Router);
  private fb = inject(FormBuilder);

  funcion = signal<FuncionInterface | null>(null);
  peliculaId = signal<string | null>(null);
  codigoCupon = signal('');
  mensajeCupon = signal('¿Tenes un cupón? Aprovecha el DESCUENTO!');
  datosCliente = signal<DatosClienteAnonimoInteface | null>(null);
  compra = input<string | null>(null);

  pelicula = computed(() => {
    const id = this.peliculaId();

    if(!id){
      return null;    
    }

    const peliSignal = this.peliculaService.getPeliculaById(id);
    return peliSignal() ?? null;
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


    this.peliculaId.set(funcion.pelicula_id);
  }

  async aplicarCupon() {
    const codigo = this.codigoCupon().trim();

    const usuario = this.authService.currentUser();

    if (!usuario) {
      this.mensajeCupon.set('No se encontro el usuario.')
      return;
    }

    const cupon = await this.compraService.validarCupon(
        codigo,
        usuario.id
    );

    if (!cupon) {
        this.mensajeCupon.set('El cupón no es válido.');
        return;
    }

    this.mensajeCupon.set('CUPÓN APLICADO CORRECTAMENTE!')
  }

  async procesarCompra(){
    // ID de la función que el usuario está comprando
    const funcionId = this.compraService.funcionSeleccionada();
    // Butaca/s q selecciono el usuario 
    const butacasIds = this.compraService.butacasSeleccionadas();

    if (!funcionId || butacasIds.length === 0) {
      return;
    }

    // creo las variables pq todavia no se si las voy a sacar 
    // del form (anonimo) o de Supabase (user logueado)
    let nombre: string;
    let apellido: string;
    let email: string;
    let usuarioId: string | null = null; // null tmb pq puede ser anonimo (sin estar registrado en Supabase)

    if(this.currentUser()){
      // perfil contiene los valores del userInterface
      const perfilUser = this.currentPerfil();
      // usuario tiene los valores de Supabase
      const usuario = this.currentUser();

      // comprobamos si existe el perfil y si no existe el usuario en Supabase
      if(!perfilUser || !usuario?.email){
        return
      }

      // Declaro los valores de las variables
      nombre = perfilUser.nombre;
      apellido = perfilUser.apellido;
      email = usuario.email;
      usuarioId = usuario.id;
    } 
    // este else contempla el caso del usuario anonimo
    else{
      // compruebo que si no hay datos en el form o son invalidaos como 
      // usuario anonimo le marco que los complete o corrija
      if(this.formCliente.invalid){
        this.formCliente.markAllAsTouched();
        return;  
      }

      // Si existen completo las variables con los
      // valores del form
      nombre = this.formCliente.value.nombre!;
      apellido = this.formCliente.value.apellido!;
      email = this.formCliente.value.email!;
    }

    // con los datos una vez obtenidos de supabase o del form
    // proceso la compra con los datos
    const compra = await this.compraService.confirmarCompra(
      nombre, apellido, email, usuarioId, funcionId, butacasIds
    );

    if(!compra){
      return; 
    }

    this.router.navigate(['/confirmacion', compra.id])
  }

  cancelarCompra() {
    this.compraService.limpiarCompra();
    this.router.navigate(['/home']);
  }
}
