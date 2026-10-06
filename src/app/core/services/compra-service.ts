import { effect, inject, Injectable, signal } from '@angular/core';
import { SupabaseService } from './supabase-service';
import { ButacaInterface } from '../models/sala.cine.interface';
import { ProductoCompraInterface, ProductosInterface } from '../models/candy_bar.interface';
import { ButacasService } from './butacas-service';


@Injectable({
  providedIn: 'root'
})
export class CompraService {
  private supabase = inject(SupabaseService).client;
  private butacasServices = inject(ButacasService);

  funcionSeleccionada = signal<string | null>(null);
  butacasSeleccionadas = signal<string[]>([]);
  prodsSeleccionados = signal<ProductoCompraInterface[]>([]);
  cuponAplicado = signal<string | null>(null); // guarda el ID del cupón que fue validado.
  porcentajeDescuento = signal<number>(0); // guarda cuánto descuento corresponde, por ejemplo 20

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

  async validarCupon(codigo: string, usuarioId: string) {

    const codigoNormalizado = codigo.trim().toUpperCase();

    const { data, error } = await this.supabase
      .from('cupones')
      .select('*')
      .eq('codigo', codigoNormalizado)
      .eq('usuario_id', usuarioId)
      .eq('usado', false)
      .single();

    if (error) {
      console.error('Error al obtener el cupon', error);
      return null;
    }

    this.cuponAplicado.set(data.id);
    this.porcentajeDescuento.set(data.porcentaje_descuento)

    return data;
  }

  async crearCompra(
    nombre: string, apellido: string, email: string, usuarioId: string | null
  ) {
    // genero to desde aca el id de la compra 
    // para insertarlo directamente a la tabla y no tener
    // q estar comparandolo con el q genera supabase
    // esto me generaba un tema con la politica al comprar
    // con un usuario anonimo ya que no dispone de usuario_id
    const compraId = crypto.randomUUID();

    const { error } = await this.supabase
      .from('compras')
      .insert({
        id: compraId,
        usuario_id: usuarioId,
        nombre,
        apellido,
        email,
        codigo_qr: crypto.randomUUID(),
        retirado: false
      });

    if (error) {
      console.error('Error al registrar la compra: ', error);
      return null;
    }

    return {
      id: compraId,
      usuario_id: usuarioId
    };
  }

  async crearEntradas(compraId: string, funcionId: string, butacasIds: string[], usuarioId: string | null) {
    const entradas = butacasIds.map(butacaId => {

      const butaca = this.butacasServices.butacas().find(
        b => b.id === butacaId
      );

      if (!butaca) {
        return null;
      }

      return {
        compra_id: compraId,
        funcion_id: funcionId,
        butaca_id: butacaId,
        usuario_id: usuarioId,
        precio: this.precioDeButaca(butaca)
      };
    }).filter(entrada => entrada !== null);

    const { data, error } = await this.supabase
      .from('entradas')
      .insert(entradas);

    console.log('Resultado entradas:', data);
    console.log('Error entradas:', error);

    if (error) {
      console.error('Error al insertar las entradas: ', error);
      return null;
    }

    return true;
  }

  async crearComprasProductos(compraId: string) {
    // prodsSeleccionados tiene los productos seleccionados y su cantidad
    // (Pochoclo -> cantidad 1)
    const productos = this.prodsSeleccionados();

    if (productos.length === 0) {
      return [];
    }

    // con map transformamos cada producto en los datos
    // que necesitamos guardar en compras_productos
    const productosCompra = productos.map(prod => ({
      compra_id: compraId,
      producto_id: prod.producto.id,
      cantidad: prod.cantidad,
      precio_unidad: prod.producto.precio
    }));

    // aca se insertan esos valores de productosCompra
    const { error } = await this.supabase
      .from('compras_productos')
      .insert(productosCompra)

    if (error) {
      console.error('Error al cargar los productos de la compra: ', error);
      return null;
    }
    return true;
  }

  async confirmarCompra(nombre: string,
    apellido: string,
    email: string,
    usuarioId: string | null,
    funcionId: string,
    butacasIds: string[]) {

    const compra = await this.crearCompra(nombre, apellido, email, usuarioId);

    if (!compra) {
      return;
    }
    const entradas = await this.crearEntradas(compra.id, funcionId, butacasIds, compra.usuario_id)

    if (!entradas) {
      return;
    }

    const butacasCompradas = await this.butacasServices.ocuparButacas(
      funcionId, butacasIds
    );

    if (!butacasCompradas) {
      return null;
    }

    const productos = await this.crearComprasProductos(compra.id);

    if (productos === null) {
      return null;
    }

    return compra;
  }

  async traerInfoCompra(compraId: string){
    const { data, error } = await this.supabase
    .from('compras')
    .select(`*, entradas (*, butacas(*), funciones(*, peliculas(*))),
                compras_productos(*, productos_candy(*))
      `)
      .eq('id', compraId)
      .single();

      if(error){
        console.error('Error al obtener los datos de la compra: ', error);
        return null;
      }

      console.log('Compra: ', data);

      return data;
  }
///////////////////////////////////////////////
  async probarProductosCompra(compraId: string) {

  const { data, error } = await this.supabase
    .from('compras_productos')
    .select(`
      *,
      productos_candy (*)
    `)
    .eq('compra_id', compraId);

  console.log('PRODUCTOS DIRECTOS:', data);
  console.log('ERROR PRODUCTOS DIRECTOS:', error);

  return data;
}
///////////////////////////////////////////
  async obtenerComprasUsuario(usuarioId: string) {
    const { data, error } = await this.supabase
      .from('compras')
      .select(`*, 
      entradas (*,butacas (*), funciones (*, peliculas (*))), compras_productos (*,productos_candy (*))`)
      .eq('usuario_id', usuarioId);

    if (error) {
      console.error('Error al obtener las compras del usuario:', error);
      return [];
    }

    return data;
  }

  async cancelarCompra(compraId: string, usuarioId: string) {

    const compra = await this.traerInfoCompra(compraId);

    if (!compra) {
      return false;
    }

    if (compra.cancelada) {
      return false;
    }

    const fechaFuncion = new Date(
      compra.entradas[0].funciones.fecha_hora
    );

    const ahora = new Date();

    const diferencia = fechaFuncion.getTime() - ahora.getTime();

    const dosHoras = 2 * 60 * 60 * 1000;

    if (diferencia < dosHoras) {
      return false;
    }

    const funcionId = compra.entradas[0].funcion_id;

    const butacasIds = compra.entradas.map(
      (entrada: any) => entrada.butaca_id
    );

    const liberadas = await this.butacasServices.liberarButacas(
      funcionId,
      butacasIds
    );

    if (!liberadas) {
      return false;
    }

    const { data, error } = await this.supabase
      .from('compras')
      .update({ cancelada: true })
      .eq('id', compraId)
      .eq('usuario_id', usuarioId)
      .select()

    console.log('Resultado del UPDATE:', data);
    console.log('Error del UPDATE:', error);

    if (error) {
      console.error('ERROR AL CANCELAR:', error);
      return false;
    }

    return true;
  }

  limpiarCompra() {
    // reseteo los estados de las signals
    this.funcionSeleccionada.set(null);
    this.butacasSeleccionadas.set([]);
    this.prodsSeleccionados.set([]);
    this.cuponAplicado.set(null);
    this.porcentajeDescuento.set(0);

    // limpio los datos q se guardaron en sessionstorage
    sessionStorage.removeItem('funcionSeleccionada');
    sessionStorage.removeItem('prodsSeleccionados');
    sessionStorage.removeItem('butacasSeleccionadas')
  }
}
