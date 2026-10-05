export interface PeliculasInterface {
    id?: string
    nombre: string;
    imagen: string;
    sinopsis: string;
    duracion: number // en minutos
    edad_restriccion: number;
}