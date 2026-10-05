import { CompraProductoInterface, ProductoCompraInterface } from "./candy_bar.interface";
import { CompraInterface } from "./compra.interface"
import { EntradaInterface } from "./entrada.interface"

export interface CompraConEntradaInterface extends CompraInterface{
    entradas: EntradaInterface[];
    compras_productos: CompraProductoInterface[];
}