import { PeliculasInterface } from "./pelicula.interface";

export interface PeliculaGenerosInterface extends PeliculasInterface {
    pelicula_genero: {
        genero_id: string;
        generos: {
            id: string;
            nombre: string
        };
    }[]; // El [] nos indica que peliculas_generos es un array
}