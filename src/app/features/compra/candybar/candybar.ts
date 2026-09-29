import { Component, computed, inject, signal, effect } from '@angular/core';
import { CategoriaCandyInterface, ProductoCompraInterface, ProductosInterface } from '../../../core/models/candy_bar.interface';
import { SupabaseService } from '../../../core/services/supabase-service';
import { CandybarService } from '../../../core/services/candybar-service';
import { CompraService } from '../../../core/services/compra-service';
import { ResumenCompra } from '../resumen-compra/resumen-compra';
import { FuncionesService } from '../../../core/services/funciones-service';
import { PeliculaService } from '../../../core/services/pelicula-service';
import { PeliculasInterface } from '../../../core/models/pelicula.interface';
import { FuncionInterface } from '../../../core/models/funcion.interface';
import { ActivatedRoute, Router } from '@angular/router';
import { errorContext } from 'rxjs/internal/util/errorContext';
import { ButacasService } from '../../../core/services/butacas-service';

@Component({
  imports: [ResumenCompra],
  selector: 'app-candybar',
  styleUrl: './candybar.css',
  templateUrl: './candybar.html',
})
export class Candybar {

  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private compraService = inject(CompraService);
  private candybarService = inject(CandybarService);
  private funcionService = inject(FuncionesService);
  private peliculaService = inject(PeliculaService);
  private butacasService = inject(ButacasService);

  categorias = this.candybarService.categorias;
  productos = this.candybarService.productos;
  prodsSeleccionados = this.compraService.prodsSeleccionados;

  categoriaSeleccionada = signal<string | null>(null);
  pelicula = signal<PeliculasInterface | null>(null);
  funcion = signal<FuncionInterface | null>(null);

  productosFiltrados = computed(() => {
    return this.productos().filter(producto => producto.categoria_id === this.categoriaSeleccionada());
  });


  constructor(){
    this.cargarFuncion();

    effect(() => {
      const categorias = this.categorias();
      // Guardamos la categoría actualmente seleccionada
      const categoriaActual = this.categoriaSeleccionada();
  
      if(categorias.length > 0 && categoriaActual === null
      ) {
        this.categoriaSeleccionada.set(categorias[0].id!);
      }
    });
  }

  async cargarFuncion(){
    // Obtenemos los parametros de la ruta actual
    // ej: candybar/:funcionId, funcionId es el parametro de ruta
    // y los escuchamos con suscribe
    this.route.paramMap.subscribe(async params => {
      
      //buscamos dentro de los parámetros el que se llama funcionId
      const funcionId = params.get('funcionId');

      if(!funcionId){
        console.error('No hay ninguna funcion seleccionada');
        return;
      }

      // Guarda el id en el signal de compraService
      this.compraService.funcionSeleccionada.set(funcionId);

      // aca guardamos la funcion(Objecto) entera, no solo el id
      // y con obtener funcion reconocemos la funcion q esta en Supabase
      const funcion = await this.funcionService.obtenerFuncion(funcionId);

      if(!funcion){
        return;
      }
      // Guardamos el objeto funcion en el signal
      this.funcion.set(funcion);

      // Cargamos todas las butacas de la sala de esta función
      await this.butacasService.obtenerButacasSala(funcion.sala_id);

      // agarramos el id de pelicula q esta en el objeto Funcion
      // para dsp q getPeliculaById nos devuelva un signal q lo guardamos en pelicula
      const pelicula = this.peliculaService.getPeliculaById(funcion.pelicula_id);
      // seteamos en el signal pelicula la pelicula q nos devolvio getPeliculaById
      this.pelicula.set(pelicula()!);
   });
  }

  seleccionarCategoria(id: string): void {
    this.categoriaSeleccionada.set(id);
  }

  agregarProducto(producto: ProductosInterface){
    // creo el metodo aca tmb y solamente llamo al de compraService
    this.compraService.agregarProducto(producto);
  }


  precioTotalCandy = computed(() => {
    const productos = this.prodsSeleccionados();

    let total = 0;

    for(const item of productos){
      const precio = item.producto.precio;
      const cantidad = item.cantidad;

      const subtotal = precio * cantidad;

      total += subtotal;
    }

    return total;
  })

}
