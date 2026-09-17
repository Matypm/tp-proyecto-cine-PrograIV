export interface ReseniaInterface {
    id?: string;
    pelicula_id: string;
    usuario_id: string;
    cantEstrellas: number;
    comentario: string;
    created_at?: string
}