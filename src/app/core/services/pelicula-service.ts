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

    // Referencia al canal de Realtime para limpieza
    private channel!: RealtimeChannel;

    constructor(){
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
    
    private async cargarPeliculasDesdeDB(): Promise<void>{
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
        .order('nombre', {ascending: true});

        if(error){
            console.error('Error al cargar peliculas desde Supabase: ', error);
        } else{
            this.peliculasSignal.set(data || []);
            console.log(`Se cargaron ${data.length ?? 0} peliculas desde Supabase`);
        }

        this.cargando.set(false);
    }

    // ======== Cargando los generos desde Supabase ========
    private async cargarGenerosDesdeDB(): Promise<void>{
        
        const { data, error } = await this.supabase
        .from('generos')
        .select('*')
        .order('nombre', { ascending: true });

        if(error){
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
    private iniciarRealtime(): RealtimeChannel{
        return this.supabase
            .channel('peliculas-realtime')
            .on('postgres_changes', 
                {event: '*', schema: 'public', table: 'peliculas'},
                (payload) => {
                    console.log('Cambio en tiempo real: ', payload.eventType, payload);

                    switch (payload.eventType){
                        // Insert - una nueva peli se agrego por otro usuario
                        case 'INSERT':
                            this.peliculasSignal.update(peliculas => [...peliculas, payload.new as PeliculaGenerosInterface]);
                            break;

                        // Update - Escucha cambios realizados en la tabla peliculas
                        case 'UPDATE':
                            this.peliculasSignal.update(peliculas => 
                                peliculas.map(p => p.id === (payload.new as PeliculaGenerosInterface).id
                                ? payload.new as PeliculaGenerosInterface
                                : p
                            )
                        );
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
    getPeliculaById(id: string){
        return computed(() => this.peliculasSignal().find(pelicula => pelicula.id === id))
    }

}
