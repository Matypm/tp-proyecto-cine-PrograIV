export interface EntradaInterface {
    id?: string;
    funcion_id: string;
    butaca_id: string;
    usuario_id: string | null; // null pq puede ser anonimo
    compra_id: string
}