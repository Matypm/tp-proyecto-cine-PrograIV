import { inject, Injectable } from "@angular/core";
import { SupabaseService } from "./supabase-service";

@Injectable({
    providedIn: 'root'
})

export class EmpleadoService {

    private supabase = inject(SupabaseService).client;

    async buscarCompraPorCodigo(codigo: string) {

        const codigoNormalizado = codigo.trim();

        if (!codigoNormalizado) {
            return null;
        }

        const { data, error } = await this.supabase
            .from('compras')
            .select(`*, 
                entradas (*, butacas (*), funciones (*, peliculas (*))), 
                compras_productos (*, productos_candy (*))`)
            .eq('codigo_qr', codigoNormalizado)
            .single();

        if (error) {
            console.error('Error al buscar la compra:', error);
            return null;
        }

        return data;
    }

    async validarEntrada(compraId: string) {

        const { data, error } = await this.supabase
            .from('compras')
            .update({entrada_validada: true})
            .eq('id', compraId)
            .eq('entrada_validada', false)
            .select()
            .single();

        if (error) {
            console.error('Error al validar la entrada:', error);
            return false;
        }

        return !!data;
    }

    async retirarCandybar(compraId: string) {

        const { data, error } = await this.supabase
            .from('compras')
            .update({candybar_retirado: true})
            .eq('id', compraId)
            .eq('candybar_retirado', false)
            .select()
            .single();

        if (error) {
            console.error('Error al retirar el candy bar:', error);
            return false;
        }

        return !!data;
    }
}