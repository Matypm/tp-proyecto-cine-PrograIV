import { effect, inject, Injectable, signal } from '@angular/core';
import { SupabaseService } from './supabase-service';
import { ButacaInterface } from '../models/sala.cine.interface';
import { ProductoCompraInterface, ProductosInterface } from '../models/candy_bar.interface';

@Injectable({
  providedIn: 'root'
})
export class CompraService {
  private supabase = inject(SupabaseService).client;


  funcionSeleccionada = signal<string | null>(null);
  butacasSeleccionadas = signal<string[]>([]);
  prodsSeleccionados = signal<ProductoCompraInterface[]>([]);

  precioNormal = 10000;
  precioVip = 17000;

  constructor() {
    this.cargarButacas();
    this.cargarFuncion();
    this.cargarProductos();

    effect(() => {
      const butacas = this.butacasSeleccionadas();
      const butacasJson = JSON.stringify(butacas);

      sessionStorage.setItem('butacasSeleccionadas', butacasJson);
    });

    effect(() => {
      const productos = this.prodsSeleccionados();
      const productosJSON = JSON.stringify(productos);

      sessionStorage.setItem('prodsSeleccionados', productosJSON);
    });

    effect(() => {
      const funcion = this.funcionSeleccionada();

      if (funcion) {
        sessionStorage.setItem('funcionSeleccionada', funcion);
      }
    });
  }

  cargarFuncion() {
    const funcionGuardada = sessionStorage.getItem('funcionSeleccionada')

    if (!funcionGuardada) {
      return;
    }

    this.funcionSeleccionada.set(funcionGuardada);
  }

  cargarProductos() {
    const productosGuardados =
      sessionStorage.getItem('prodsSeleccionados');

    if (!productosGuardados) {
      return;
    }

    const productosParseados =
      JSON.parse(productosGuardados);

    this.prodsSeleccionados.set(productosParseados);
  }

  esVip(fila: string): boolean {
    return fila === 'R' || fila === 'S' || fila === 'T';
  }

  precioDeButaca(butaca: ButacaInterface): number {

    if (this.esVip(butaca.fila)) {
      return this.precioVip;
    }

    return this.precioNormal;
  }

  agregarProducto(producto: ProductosInterface) {
    const seleccionados = this.prodsSeleccionados();

    // El find() busca dentro de este array un elemento que cumpla esta condición
    const prodExistente = seleccionados.find(
      itemSeleccionado => itemSeleccionado.producto.id === producto.id);

    // aca si el prod ya existe en en el array de seleccionados
    // le sumamos 1 de cantidad, si no lo dejamos como esta
    if (prodExistente) {
      this.prodsSeleccionados.update(productosActuales => productosActuales.map(
        item => item.producto.id === producto.id
          ? { ...item, cantidad: item.cantidad + 1 } : item
      )
      );
    }
    // en esta parte le seteamos 1 de cantidad al producto
    // pq es la primera vez q se esta agregando a la compra
    else {
      this.prodsSeleccionados.update(productos => [
        ...productos,
        {
          producto: producto,
          cantidad: 1
        }
      ]);
    }
  }

  sacarProducto(producto: ProductosInterface) {
    const seleccionados = this.prodsSeleccionados();

    const indice = seleccionados.findIndex(
      item => item.producto.id === producto.id
    );

    // Si no encontro ninguno con esa condicion sale de la funcion
    if (indice === -1) {
      return;
    }

    // Si tiene más de una unidad, recorro el array y
    // disminuyo en 1 la cantidad del producto seleccionado.
    if (seleccionados[indice].cantidad > 1) {
      this.prodsSeleccionados.update(productos =>
        productos.map((item, i) =>
          i === indice ? { ...item, cantidad: item.cantidad - 1 } : item)
      );
    }
    else {
      this.prodsSeleccionados.update(productos =>
        productos.filter((_item, i) => i !== indice)
      );
    }
  }

  cargarButacas() {
    const butacasGuardadas = sessionStorage.getItem('butacasSeleccionadas');

    if (!butacasGuardadas) {
      return;
    }

    const butacasParseadas = JSON.parse(butacasGuardadas);
    this.butacasSeleccionadas.set(butacasParseadas);
    console.log('Butacas recuperadas:', butacasParseadas);
  }
}
