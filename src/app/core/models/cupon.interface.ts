export type TipoCupon = 'bienvenida' | 'mayor_50'

export interface CuponInterface {
    id?: string;
    usuario_id: string;
    tipo: TipoCupon;
    porcentaje_descuento: number;
    usado: boolean;
    codigo: string;
}