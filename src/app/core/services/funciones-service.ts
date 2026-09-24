import { inject, Injectable, signal } from '@angular/core';
import { SupabaseService } from './supabase-service';
import { FuncionInterface } from '../models/funcion.interface';
import { PeliculaGenerosInterface } from '../models/peliculas_generos.interface';

@Injectable({
    providedIn: 'root'
})
export class FuncionesService {

    private supabase = inject(SupabaseService).client;

    cargando = signal(false);
    funciones = signal<FuncionInterface[]>([]);
    

    constructor(){
        
    }

    // ====== Cargar funciones desde Supabase ======
    async cargarFuncionesPorPelicula(peliculaId: string): Promise<void>{
        this.cargando.set(true);

        const { data, error } = await this.supabase
        .from('funciones')
        .select('*')
        .eq('pelicula_id', peliculaId)

        

        if(error){
            console.error('Error al cargar las funciones', error);
        } else {
            this.funciones.set(data || []);
        }

    }
    
}
