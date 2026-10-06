import { computed, DestroyRef, inject, Injectable, signal } from '@angular/core';
import { SupabaseService } from './supabase-service';
import { PeliculasInterface } from '../models/pelicula.interface';
import { RealtimeChannel } from '@supabase/supabase-js';
import { PeliculaGenerosInterface } from '../models/peliculas_generos.interface';
import { GeneroInterface } from '../models/genero.interface';

@Injectable({
    providedIn: 'root'
})
export class PeliculaService {

    private supabase = inject(SupabaseService).client
    private destroyRef = inject(DestroyRef);

    // signal() privado - solo el service modifica la lista directamente
    private peliculasSignal = signal<PeliculaGenerosInterface[]>([]);
    generos = signal<GeneroInterface[]>([]);

    cargando = signal(false);

    // actualiza automaticamente cuando peliculasSignal cambia
    peliculas = computed(() => this.peliculasSignal());
    imagenSeleccionada: File | null = null;

    // Referencia al canal de Realtime para limpieza
    private channel!: RealtimeChannel;

    constructor() {
        // Cargamos las peliculas desde supabase
        this.cargarPeliculasDesdeDB();
        this.cargarGenerosDesdeDB();

        // Me suscribo a los cambios en tiempo real
        this.channel = this.iniciarRealtime();

        //
        this.destroyRef.onDestroy(() => {
            this.supabase.removeChannel(this.channel);
        })
    }

    // =========== Cargar pelis desde Supabase ===========

    private async cargarPeliculasDesdeDB(): Promise<void> {
        this.cargando.set(true);

        const { data, error } = await this.supabase
            .from('peliculas')
            .select(`
            *,
            pelicula_genero (
                genero_id,
                generos (
                    id,
                    nombre
                )
            )
        `)
            .order('nombre', { ascending: true });

        if (error) {
            console.error('Error al cargar peliculas desde Supabase: ', error);
        } else {
            this.peliculasSignal.set(data || []);
            console.log(`Se cargaron ${data.length ?? 0} peliculas desde Supabase`);
        }

        this.cargando.set(false);
    }

    // ======== Cargando los generos desde Supabase ========
    private async cargarGenerosDesdeDB(): Promise<void> {

        const { data, error } = await this.supabase
            .from('generos')
            .select('*')
            .order('nombre', { ascending: true });

        if (error) {
            console.log('Error al cargar generos: ', error)
        } else {
            this.generos.set(data || []);
        }
    }

    // ============================================================
    // REALTIME — Escucha cambios en la tabla 'peliculas' en tiempo real
    // Cuando OTRO usuario reserva un libro, TODOS los clientes conectados
    // ven el cambio automáticamente sin recargar la página
    // ============================================================
    private iniciarRealtime(): RealtimeChannel {
        return this.supabase
            .channel('peliculas-realtime')
            .on('postgres_changes',
                { event: '*', schema: 'public', table: 'peliculas' },
                (payload) => {
                    console.log('Cambio en tiempo real: ', payload.eventType, payload);

                    switch (payload.eventType) {
                        // Insert - una nueva peli se agrego por otro usuario
                        case 'INSERT':
                            this.cargarPeliculasDesdeDB();
                            break;

                        // Update - Escucha cambios realizados en la tabla peliculas
                        case 'UPDATE':
                            this.cargarPeliculasDesdeDB();
                            break;

                        // Delete - una peli es eliminada
                        case 'DELETE':
                            this.peliculasSignal.update(peliculas =>
                                peliculas.filter(p => p.id != (payload.old as { id: string }).id)
                            );
                            break;
                    }
                }
            )
            .subscribe();
    }

    // Obtener una peli por ID - retorna un computed q se actualiza reactivamente
    getPeliculaById(id: string) {
        return computed(() => this.peliculasSignal().find(pelicula => pelicula.id === id))
    }

    async crearPelicula(pelicula: Omit<PeliculasInterface, 'imagen'>, imagen: File) {
        const imagenUrl = await this.subirImagen(imagen);

        const peliculaConImagen = {
            ...pelicula,
            imagen: imagenUrl
        };

        const { data, error } = await this.supabase
            .from('peliculas')
            .insert(peliculaConImagen)
            .select()
            .single();

        if (error) {
            console.error('Error al crear la película:', error);
            return null;
        }

        console.log('Película creada:', data);

        return data;
    }

    async subirImagen(imagen: File): Promise<string> {
        const nombreArchivo = `${Date.now()}_${imagen.name}`;

        const { error } = await this.supabase.storage
            .from('peliculas')
            .upload(nombreArchivo, imagen);

        if (error) {
            console.error('Error al subir la imagen: ', error);
            throw error;
        }

        const { data: urlData } = this.supabase.storage
            .from('peliculas')
            .getPublicUrl(nombreArchivo);

        return urlData.publicUrl;
    }

    async agregarGeneros(peliculaId: string, generosIds: string[]) {
        const relaciones = generosIds.map(generoId => ({
            pelicula_id: peliculaId, genero_id: generoId
        }));

        const { error } = await this.supabase
            .from('pelicula_genero')
            .insert(relaciones);

        if (error) {
            console.error('Error al agregar géneros:', error);
            throw error;
        }
    }

    async obtenerPeliculaPorId(id: string): Promise<PeliculaGenerosInterface | null> {

        const { data, error } = await this.supabase
            .from('peliculas')
            .select(`*, pelicula_genero(genero_id, generos(id, nombre))`)
            .eq('id', id)
            .single();

        if (error) {
            console.error('Error al obtener la película:', error);
            return null;
        }

        return data;
    }

    async actualizarPelicula(
        id: string,
        pelicula: {
            nombre: string;
            sinopsis: string;
            duracion: number;
            edad_restriccion: number;
        }
    ) {
        const { data, error } = await this.supabase
            .from('peliculas')
            .update(pelicula)
            .eq('id', id)
            .select()
            .single();

        if (error) {
            console.error('Error al actualizar la película:', error);
            return null;
        }

        console.log('Película actualizada:', data);
        return data;
    }

    async actualizarImagenPelicula(id: string, imagen: File) {
        const imagenUrl = await this.subirImagen(imagen);

        const { data, error } = await this.supabase
            .from('peliculas')
            .update({
                imagen: imagenUrl
            })
            .eq('id', id)
            .select()
            .single();

        if (error) {
            console.error('Error al actualizar la imagen:', error);
            return null;
        }

        console.log('Imagen actualizada:', data);

        return data;
    }

    async actualizarGeneros(peliculaId: string, generosIds: string[]): Promise<boolean> {
        const { error: errorEliminar } = await this.supabase
            .from('pelicula_genero')
            .delete()
            .eq('pelicula_id', peliculaId);

        if (errorEliminar) {
            console.error('Error al eliminar géneros anteriores:', errorEliminar);
            return false;
        }

        if (generosIds.length === 0) {
            return true;
        }

        const relaciones = generosIds.map(generoId => ({
            pelicula_id: peliculaId,
            genero_id: generoId
        }));

        const { error: errorInsertar } = await this.supabase
            .from('pelicula_genero')
            .insert(relaciones);

        if (errorInsertar) {
            console.error('Error al insertar nuevos géneros:', errorInsertar);
            return false;
        }

        return true;
    }

    async eliminarPelicula(id: string): Promise<boolean> {
        const { error } = await this.supabase
            .from('peliculas')
            .delete()
            .eq('id', id);

        if (error) {
            console.error('Error al eliminar la película:', error);
            return false;
        }

        const hayFunciones = await this.hayFunciones(id);

        if(hayFunciones){
            console.error('No se puede eliminar la pelicula, tiene funciones');
            return false;
        }

        const { error: errorEliminar } = await this.supabase
        .from('peliculas')
        .delete()
        .eq('id', id);

        if(errorEliminar){
            console.error('Error al eliminar la pelicula: ', errorEliminar);
            return false;
        }

        alert('Película eliminada correctamente');
        return true;
    }

    async hayFunciones(idPelicula: string): Promise<boolean> {
        const { data, error } = await this.supabase
            .from('funciones')
            .select('id')
            .eq('pelicula_id', idPelicula)
            .limit(1);

        if (error) {
            console.error('Error al verificar funciones:', error);
            return true;
        }

        return data.length > 0;
    }



}
