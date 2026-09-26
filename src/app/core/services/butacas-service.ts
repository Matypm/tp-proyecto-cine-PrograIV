import { inject, Injectable, signal } from '@angular/core';
import { SupabaseService } from './supabase-service';
import { ButacaInterface } from '../models/sala.cine.interface';
import { ButacaFuncionInterface } from '../models/butaca-funcion.interface';

@Injectable({
    providedIn: 'root'
})
export class ButacasService {
    private supabase = inject(SupabaseService).client;

    // Todas las butacas físicas de la sala.
    butacas = signal<ButacaInterface[]>([]);
    // Las butacas que están ocupadas específicamente para esa función.
    butacasOcupadas = signal<ButacaFuncionInterface[]>([]);

    constructor(){

    }

    async obtenerButacasSala(salaId: string){
        const { data, error } = await this.supabase
        .from('butacas')
        .select('*')
        .eq('sala_id', salaId)

        if(error){
            console.error('Error al intentar obtener las butacas: ', error);
            return;
        }

        this.butacas.set(data || []);
    }

    async obtenerButacasOcupadas(funcionId:string){
        const { data, error } = await this.supabase
        .from('butacas_funciones')
        .select('*')
        .eq('funcion_id', funcionId)

        if(error){
            console.error('Error al obtener las butacas ocupapdas: ', error);
            return;
        }

        this.butacasOcupadas.set(data || []);
    }




}
