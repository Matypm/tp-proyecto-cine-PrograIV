import { DestroyRef, inject, Injectable, signal } from '@angular/core';
import { SupabaseService } from './supabase-service';
import { ButacaInterface } from '../models/sala.cine.interface';
import { ButacaFuncionInterface } from '../models/butaca-funcion.interface';
import { RealtimeChannel } from '@supabase/supabase-js';
import { MapaButacas } from '../../features/compra/mapa-butacas/mapa-butacas';
import { FuncionInterface } from '../models/funcion.interface';

@Injectable({
    providedIn: 'root'
})
export class ButacasService {
    private supabase = inject(SupabaseService).client;

    // Todas las butacas físicas de la sala.
    butacas = signal<ButacaInterface[]>([]);
    // Las butacas que están ocupadas específicamente para esa función.
    butacasOcupadas = signal<ButacaFuncionInterface[]>([]);

    private channel?: RealtimeChannel;

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

    // ========== REALTIME ==========
    iniciarRealtime(funcionId:string): void {
        this.channel = this.supabase
        .channel('butacas-funciones-realtime')
        .on('postgres_changes',
            { 
                event: '*', 
                schema: 'public', 
                table: 'butacas_funciones', 
                filter: 'funcion_id=eq.' + funcionId },

            (payload) => {
                console.log('Cambio en tiempo real:', payload.eventType, payload);
                
                switch (payload.eventType) {
                    // INSERT cuando se reserva/compra una butaca
                    case 'INSERT':
                        this.butacasOcupadas.update(ocupadas => 
                            [...ocupadas, payload.new as ButacaFuncionInterface]);
                        break;

                    case 'DELETE':
                        this.butacasOcupadas.update(ocupadas => 
                            ocupadas.filter(o => o.id !== (payload.old as { id: string }).id)
                        );
                        break;
                }
            }
        )
        .subscribe();
    }

    detenerRealtime(): void {
        if(this.channel){
            this.supabase.removeChannel(this.channel);
            this.channel = undefined;
        }
    }
    




}
