import { inject, Injectable, signal } from '@angular/core';
import { SupabaseService } from './supabase-service';
import { ButacaInterface } from '../models/sala.cine.interface';
import { ProductoCompraInterface } from '../models/candy_bar.interface';

@Injectable({
    providedIn: 'root'
})
export class CompraService {
    private supabase = inject(SupabaseService).client;
    

    funcionSeleccionada = signal<string | null>(null);
    butacasSeleccionadas = signal<string[]>([]);
    prodsSeleccionados = signal<ProductoCompraInterface[]>([]);

    precioNormal = 10000;
    precioVip = 17000;

    esVip(fila: string): boolean {
        return fila === 'R' || fila === 'S' || fila === 'T';
    }

    precioDeButaca(butaca: ButacaInterface): number {

        if (this.esVip(butaca.fila)) {
            return this.precioVip;
        }

        return this.precioNormal;
    }
}
