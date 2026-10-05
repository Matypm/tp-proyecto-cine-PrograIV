export interface CategoriaCandyInterface {
    id?: string;
    nombre: string;
}

// representa el producto que existe en el catálogo.
export interface ProductosInterface {
    id?: string;
    categoria_id: string;
    nombre: string;
    precio: number;
    imagen?: string;
    created_at?: string;
}

// representa ese producto dentro de una compra concreta.
export interface ProductoCompraInterface {
    cantidad: number;
    producto: ProductosInterface;
}

// Registro de compras_productos ya guardado
export interface CompraProductoInterface {
    producto_id: string;
    cantidad: number;
    precio_unidad: number;
    productos_candy: ProductosInterface;
}