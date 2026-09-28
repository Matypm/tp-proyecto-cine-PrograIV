import { inject, Injectable, signal } from '@angular/core';
import { SupabaseService } from './supabase-service';
import { CategoriaCandyInterface, ProductosInterface } from '../models/candy_bar.interface';


@Injectable({
    providedIn: 'root'
})
export class CandybarService {
    private supabase = inject(SupabaseService).client;

    categorias = signal<CategoriaCandyInterface[]>([]);
    productos = signal<ProductosInterface[]>([]);

    constructor(){
        this.cargarCategorias();
        this.cargarProductos();
    }


    async cargarCategorias(): Promise<void>{
        const { data, error } = await this.supabase
        .from('categorias_candy')
        .select('*')
        .order('nombre', { ascending: true });

        if(error){
            console.error('No se pudo obtener las categorias: ', error);
            return;
        }

        this.categorias.set(data || []);
    }

    async cargarProductos(): Promise<void>{
        const { data, error } = await this.supabase
        .from('productos_candy')
        .select('*')
        .order('nombre', { ascending: true })

        if(error){
            console.error('Ocurrio un error al cargar los productos:', error);
            return;
        }

        this.productos.set(data || []);
    }


}
