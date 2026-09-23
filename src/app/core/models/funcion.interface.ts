export type FormatoPelicula = '2d' | '3d' | '4d' | '5d';
export type IdiomaPelicula = 'castellano' | 'subtitulada'

export interface FuncionInterface {
    id?: string;
    pelicula_id: string;
    sala_id: string;
    fecha_hora: string;
    formato: FormatoPelicula;
    idioma: IdiomaPelicula;
}