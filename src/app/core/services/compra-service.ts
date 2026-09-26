import { inject, Injectable, signal } from '@angular/core';
import { SupabaseService } from './supabase-service';

@Injectable({
    providedIn: 'root'
})
export class CompraService {
    private supabase = inject(SupabaseService).client;


    funcionSeleccionada = signal<string | null>(null);

    
}
