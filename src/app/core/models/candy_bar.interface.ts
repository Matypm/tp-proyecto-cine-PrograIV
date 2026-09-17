export interface CategoriaCandyInterface {
    id?: string;
    nombre: string;
}

export interface ProductosInterface {
    id?: string;
    categoria_id: string;
    nombre: string;
    precio: number;
    imagen?: string;
    created_at?: string;
}