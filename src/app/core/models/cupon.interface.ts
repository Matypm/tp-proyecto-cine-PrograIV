export type TipoCupon = 'bienvenida' | 'mayor_50'

export interface CuponInterface {
    id?: string;
    id_usuario: string;
    tipo: TipoCupon;
    porcentaje_descuento: number;
    usado: boolean;
}