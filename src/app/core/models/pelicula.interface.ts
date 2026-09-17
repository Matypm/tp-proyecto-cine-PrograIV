export type FormatoPelicula = '2d' | '3d' | '4d' | '5d';
export type IdiomaPelicula = 'castellano' | 'subtitulada'


export interface PeliculasInterface {
    id?: string
    nombre: string;
    imagen: string;
    sinopsis: string;
    duracion: number // en minutos
    formato: FormatoPelicula;
    idioma: IdiomaPelicula;
}