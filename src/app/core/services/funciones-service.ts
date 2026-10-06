import { inject, Injectable, signal } from '@angular/core';
import { SupabaseService } from './supabase-service';
import { FormatoPelicula, FuncionInterface, IdiomaPelicula } from '../models/funcion.interface';
import { SalaInterface } from '../models/sala.cine.interface';
import { PeliculasInterface } from '../models/pelicula.interface';

@Injectable({
    providedIn: 'root'
})
export class FuncionesService {

    private supabase = inject(SupabaseService).client;

    cargando = signal(false);
    funciones = signal<FuncionInterface[]>([]);
    salas = signal<SalaInterface[]>([]);

    constructor() {

    }

    // ====== Cargar funciones desde Supabase ======
    async cargarFuncionesPorPelicula(peliculaId: string): Promise<void> {
        this.cargando.set(true);

        const { data, error } = await this.supabase
            .from('funciones')
            .select('*')
            .eq('pelicula_id', peliculaId)



        if (error) {
            console.error('Error al cargar las funciones', error);
        } else {
            this.funciones.set(data || []);
        }

    }

    async obtenerFuncion(funcionId: string): Promise<FuncionInterface | null> {
        const { data, error } = await this.supabase
            .from('funciones')
            .select(`
            *,
            salas (
                id,
                nombre
            )
        `)
            .eq('id', funcionId)
            .single()

        if (error) {
            console.error('Error al obtener la funcion:', error);
            return null;
        }

        console.log('Funcion obtenida:', data);

        return data;
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

    async verDisponibilidadSala(
        salaId: string,
        fechaHora: string,
        duracionNueva: number,
        funcionIdActual?: string): Promise<boolean> {
        // Buscamos todas las funciones que ya existen en esa sala
        const { data, error } = await this.supabase
            .from('funciones')
            .select(`id, fecha_hora, peliculas (duracion)`)
            .eq('sala_id', salaId);

        if (error) {
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
        for (const funcion of data || []) {

            if (funcionIdActual && funcion.id! === funcionIdActual) {
                continue;
            }

            const inicioExistente = new Date(
                funcion.fecha_hora
            );

            // Lo q dura la pelicula ya existente
            const duracionExistente =  (funcion.peliculas as any)?.duracion;

            if (!duracionExistente) {
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

            if (sePisan) {
                return false;
            }
        }

        // Si no hay pisadas ni nada esta disponible la sala
        return true;
    }

    async buscarSalaDisponible(fechaHora: string, duracion: number, funcionIdActual?: string): Promise<string | null> {
        const { data, error } = await this.supabase
            .from('salas')
            .select('*')

        if (error) {
            console.error('Error al solicitar las salas', error);
            return null;
        }

        for (const sala of data || []) {
            const disponible = await this.verDisponibilidadSala(sala.id, fechaHora, duracion, funcionIdActual);

            if (disponible) {
                return sala.id;
            }
        }
        return null;
    }

    async crearFuncion(peliculaId: string, fechaHora: string, formato: FormatoPelicula, idioma: IdiomaPelicula): Promise<boolean> {
        const { data, error } = await this.supabase
            .from('peliculas')
            .select('duracion')
            .eq('id', peliculaId)
            .single();

        if (error) {
            console.error(
                'Error al obtener la duración de la película:',
                error
            );
            return false;
        }

        // Convertir DD/MM/AAAA HH:MM
        // a YYYY-MM-DDTHH:MM:SS-03:00 para Supabase
        const [fecha, hora] = fechaHora.split(' ');
        const [dia, mes, anio] = fecha.split('/');

        const fechaParaGuardar =
            `${anio}-${mes}-${dia}T${hora}:00-03:00`;

        console.log('Fecha ingresada:', fechaHora);
        console.log('Fecha convertida:', fechaParaGuardar);

        const salaDisponible = await this.buscarSalaDisponible(
            fechaParaGuardar,
            data.duracion
        );

        if (!salaDisponible) {
            console.error('No hay salas disponibles.');
            return false;
        }

        const { error: errorInsertar } = await this.supabase
            .from('funciones')
            .insert({
                pelicula_id: peliculaId,
                sala_id: salaDisponible,
                fecha_hora: fechaParaGuardar,
                formato,
                idioma
            });

        if (errorInsertar) {
            console.error(
                'Error al crear la función:',
                errorInsertar
            );
            return false;
        }

        return true;
    }

    // ==================================================================
    // ======== Funciones para las funciones del lado del admin =========
    async cargarTodasLasFunciones(): Promise<void> {
        this.cargando.set(true);

        const { data, error } = await this.supabase
            .from('funciones')
            .select(`*,
                peliculas (id, nombre, duracion), 
                salas (id, nombre)`)
            .order('fecha_hora');

        if (error) {
            console.error('Error al cargar las funciones:', error);
            this.funciones.set([]);
            this.cargando.set(false);
            return;
        }

        this.funciones.set(data ?? []);
        this.cargando.set(false);
    }

    async eliminarFuncion(id: string): Promise<boolean> {
        const { error } = await this.supabase
            .from('funciones')
            .delete()
            .eq('id', id);

        if (error) {
            console.error('Error al eliminar la función:', error);
            return false;
        }

        return true;
    }

    // me va a servir para cuando este creando la funcion
    // y seleccione para que pelicula es la funcion
    async obtenerPeliculas(): Promise<PeliculasInterface[]> {
        const { data, error } = await this.supabase
            .from('peliculas')
            .select('*')
            .order('nombre');

        if (error) {
            console.error('Error al cargar las películas:', error);
            return [];
        }

        return data ?? [];
    }

    async actualizarFuncion(funcionId: string, peliculaId: string, fechaHora: string, formato: FormatoPelicula, idioma: IdiomaPelicula): Promise<boolean> {
        const { data, error } = await this.supabase
            .from('peliculas')
            .select('duracion')
            .eq('id', peliculaId)
            .single();

        if (error) {
            console.error(
                'Error al obtener la duración de la película:',
                error
            );
            return false;
        }

        // Convertir DD/MM/AAAA HH:MM
        // a YYYY-MM-DDTHH:MM:SS-03:00 para Supabase de nuevo
        const [fecha, hora] = fechaHora.split(' ');
        const [dia, mes, anio] = fecha.split('/');

        const fechaParaGuardar = `${anio}-${mes}-${dia}T${hora}:00-03:00`;

        console.log('Fecha ingresada:', fechaHora);
        console.log('Fecha convertida:', fechaParaGuardar);

        // Buscar una sala disponible.
        const salaDisponible = await this.buscarSalaDisponible(fechaParaGuardar, data.duracion, funcionId);

        if (!salaDisponible) {
            console.error('No hay salas disponibles.');
            return false;
        }

        const { error: errorActualizar } = await this.supabase
            .from('funciones')
            .update({
                pelicula_id: peliculaId,
                sala_id: salaDisponible,
                fecha_hora: fechaParaGuardar,
                formato,
                idioma
            })
            .eq('id', funcionId);

        if (errorActualizar) {
            console.error(
                'Error al actualizar la función:',
                errorActualizar
            );
            return false;
        }
        return true;
    }


}
