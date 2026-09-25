import { inject, Injectable, signal } from '@angular/core';
import { SupabaseService } from './supabase-service';
import { FuncionInterface } from '../models/funcion.interface';

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

    // ===== LOGICA DE FUNCIONES + 30 MINS =====
    private sumarMinutos(fecha: Date, minutos: number): Date {
        // Convierte los minutos a milisegundos y los suma a la fecha
        return new Date(
            // getTime() convierte la fecha en un número expresado en milisegundos 
            // para que JavaScript pueda hacer la cuenta
            // 1 minuto = 60 segundos
            // 1 segundo = 1000 milisegundos | 1 min = 60 x 1000 = 60.000 ms
            fecha.getTime() + minutos * 60 * 1000 
        );
    }

    async verDisponibilidadSala(salaId:string, fechaHora:string, duracionNueva: number): Promise<boolean>{
        // Buscamos todas las funciones que ya existen en esa sala
        const { data, error } = await this.supabase
        .from('funciones')
        .select(`
            fecha_hora,
            peliculas (
                duracion
            )
        `)
        .eq('sala_id', salaId);

        if(error){
            console.error('Error al consultar la disponibilidad de la sala: ', error);
            return false;
        }

        // Inicio de nueva funcion
        const inicioNueva = new Date(fechaHora);

        // Fin de nueva funcion
        const finNueva = this.sumarMinutos(inicioNueva, duracionNueva);

        // Fin de nueva funcion más los 30 mins de espera
        const finNuevaConEspera = this.sumarMinutos(finNueva, 30);

        // Se revisa todas las funciones q existan
        for(const funcion of data || []){

            const inicioExistente = new Date(
                funcion.fecha_hora
            );

            // Lo q dura la pelicula ya existente
            const duracionExistente = funcion.peliculas?.[0]?.duracion;

            if(!duracionExistente){
                continue;
            }

            // Fin de la existente
            const finExistente = this.sumarMinutos(inicioExistente, duracionExistente);

            // Fin de la q existe + 30 min
            const finExistenteConEspera = this.sumarMinutos(finExistente, 30);

            // Comprobar si no se pisa la funcion q agreguemos
            // ni con la de atras ni adelante
            const sePisan = inicioNueva < finExistenteConEspera &&
                            finNuevaConEspera > inicioExistente;
            
            if(sePisan){
                return false;
            }
        }

        // Si no hay pisadas ni nada esta disponible la sala
        return true;



    }

    
    
}
