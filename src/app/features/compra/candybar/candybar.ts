import { Component, computed, inject, signal, effect } from '@angular/core';
import { CategoriaCandyInterface, ProductoCompraInterface, ProductosInterface } from '../../../core/models/candy_bar.interface';
import { SupabaseService } from '../../../core/services/supabase-service';
import { CandybarService } from '../../../core/services/candybar-service';
import { CompraService } from '../../../core/services/compra-service';

@Component({
  imports: [],
  selector: 'app-candybar',
  styleUrl: './candybar.css',
  templateUrl: './candybar.html',
})
export class Candybar {

  private compraService = inject(CompraService);
  private candybarService = inject(CandybarService);

  categorias = this.candybarService.categorias;
  productos = this.candybarService.productos;

  categoriaSeleccionada = signal<string | null>(null);
  prodsSeleccionados = this.compraService.prodsSeleccionados;

  productosFiltrados = computed(() => {
    return this.productos().filter(producto => producto.categoria_id === this.categoriaSeleccionada());
  });


  constructor(){
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

  seleccionarCategoria(id: string): void {
    this.categoriaSeleccionada.set(id);
  }

  agregarProducto(producto: ProductosInterface){
    const seleccionados = this.prodsSeleccionados();

    // El find() busca dentro de este array un elemento que cumpla esta condición
    const prodExistente = seleccionados.find(
      itemSeleccionado => itemSeleccionado.producto.id === producto.id);

    // aca si el prod ya existe en en el array de seleccionados
    // le sumamos 1 de cantidad, si no lo dejamos como esta
    if(prodExistente){
      this.prodsSeleccionados.update(productosActuales => productosActuales.map(
        item => item.producto.id === producto.id
        ? {...item, cantidad: item.cantidad + 1} : item
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

  sacarProducto(producto: ProductosInterface){
    const seleccionados = this.prodsSeleccionados();

    const indice = seleccionados.findIndex(
      item => item.producto.id === producto.id
    );

    // Si no encontro ninguno con esa condicion sale de la funcion
    if(indice === -1){
      return;
    }

    // Si tiene más de una unidad, recorro el array y
    // disminuyo en 1 la cantidad del producto seleccionado.
    if(seleccionados[indice].cantidad > 1){
      this.prodsSeleccionados.update(productos => 
        productos.map((item, i) => 
          i === indice ? {...item, cantidad: item.cantidad - 1} : item)
      );
    }
    else{
      this.prodsSeleccionados.update(productos => 
        productos.filter((_item, i) => i !== indice)
      );
    }
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
