import { inject, Injectable, signal } from "@angular/core";
import { SupabaseService } from "./supabase-service";
import { ButacaInterface, SalaInterface } from "../models/sala.cine.interface";

@Injectable({
    providedIn: 'root'
})
export class SalaService {

    private supabase = inject(SupabaseService).client;

    salas = signal<SalaInterface[]>([]);
    butacas = signal<ButacaInterface[]>([]);
    cargando = signal(false);


    async cargarSalas(): Promise<void> {
        this.cargando.set(true);

        const { data, error } = await this.supabase
            .from('salas')
            .select('*')
            .order('nombre');

        if (error) {
            console.error('Error al cargar las salas:', error);
            this.cargando.set(false);
            return;
        }

        this.salas.set(data ?? []);
        this.cargando.set(false);
    }

    async crearSala(nombre: string): Promise<boolean> {
        const { error } = await this.supabase
            .from('salas')
            .insert({
                nombre: nombre
            });

        if (error) {
            console.error('Error al crear la sala:', error);
            return false;
        }

        return true;
    }

    async actualizarSala(id: string, nombre: string): Promise<boolean> {
        const { error } = await this.supabase
            .from('salas')
            .update({
                nombre: nombre
            })
            .eq('id', id);

        if (error) {
            console.error('Error al actualizar la sala:', error);
            return false;
        }

        return true;
    }

    async cargarButacasPorSala(salaId: string): Promise<void> {
        const { data, error } = await this.supabase
            .from('butacas')
            .select('*')
            .eq('sala_id', salaId)
            .order('fila')
            .order('columna');

        if (error) {
            console.error('Error al cargar butacas:', error);
            this.butacas.set([]);
            return;
        }

        this.butacas.set(data ?? []);
    }

    async tieneFunciones(idSala: string): Promise<boolean> {
        const { data, error } = await this.supabase
            .from('funciones')
            .select('id')
            .eq('sala_id', idSala)
            .limit(1); // Comprobamos q haya al menos una funcion en la sala

        if (error) {
            console.error('Error al verificar funciones:', error);
            // Si no se puede verificar, tiramos true para q no se
            // modifique nada
            return true;
        }

        return (data?.length ?? 0) > 0;
    }

    async eliminarSala(idSala: string): Promise<boolean> {
        const tieneFunciones = await this.tieneFunciones(idSala);

        if (tieneFunciones) {
            console.error('No se puede eliminar la sala porque tiene funciones relacionadas');
            return false;
        }

        const { error } = await this.supabase
            .from('salas')
            .delete()
            .eq('id', idSala);

        if (error) {
            console.error('Error al eliminar sala:', error);
            return false;
        }

        return true;
    }
}