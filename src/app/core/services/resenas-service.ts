import { inject, Injectable, signal } from "@angular/core";
import { SupabaseService } from "./supabase-service";
import { ReseniaInterface } from "../models/resenias.interface";

@Injectable({
    providedIn: 'root'
})

export class ResenasService {
    
    private supabase = inject(SupabaseService).client;

    resenas = signal<ReseniaInterface[]>([]);
    cargando = signal(false);


    async cargarResenas(peliculaId: string) {
        this.cargando.set(true);

        const { data, error } = await this.supabase
            .from('resenas')
            .select('*')
            .eq('pelicula_id', peliculaId)
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error al cargar las reseñas:', error);
            this.resenas.set([]);
        } else {
            this.resenas.set(data);
        }

        this.cargando.set(false);
    }

    async crearResena(peliculaId: string, usuarioId: string, estrellas: number, comentario: string) {
        const { data, error } = await this.supabase
            .from('resenas')
            .insert({
                pelicula_id: peliculaId,
                usuario_id: usuarioId,
                estrellas,
                comentario
            })
            .select()
            .single();

        if (error) {
            console.error('Error al crear la reseña:', error);
            return null;
        }

        return data;
    }

    async eliminarResena(id: string) {
        const { error } = await this.supabase
            .from('resenas')
            .delete()
            .eq('id', id);

        if (error) {
            console.error('Error al eliminar la reseña:', error);
            return false;
        }

        return true;
    }
}