import { inject, Injectable, signal } from '@angular/core';
import { SupabaseService } from './supabase-service';
import { CategoriaCandyInterface, ProductosInterface } from '../models/candy_bar.interface';
import { CompraService } from './compra-service';


@Injectable({
    providedIn: 'root'
})
export class CandybarService {
    private supabase = inject(SupabaseService).client;

    categorias = signal<CategoriaCandyInterface[]>([]);
    productos = signal<ProductosInterface[]>([]);

    constructor() {
        this.cargarCategorias();
        this.cargarProductos();
    }


    async cargarCategorias(): Promise<void> {
        const { data, error } = await this.supabase
            .from('categorias_candy')
            .select('*')
            .order('nombre', { ascending: true });

        if (error) {
            console.error('No se pudo obtener las categorias: ', error);
            return;
        }

        this.categorias.set(data || []);
    }

    async cargarProductos(): Promise<void> {
        const { data, error } = await this.supabase
            .from('productos_candy')
            .select('*')
            .order('nombre', { ascending: true })

        if (error) {
            console.error('Ocurrio un error al cargar los productos:', error);
            return;
        }

        this.productos.set(data || []);
    }


    // ==============================================
    // ============= Funciones de admin =============
    async crearProducto(nombre: string, categoriaId: string, precio: number): Promise<boolean> {
        const { error } = await this.supabase
            .from('productos_candy')
            .insert({
                nombre,
                categoria_id: categoriaId,
                precio
            });

        if (error) {
            console.error('Error al crear el producto:', error);
            return false;
        }

        await this.cargarProductos();

        return true;
    }

    async actualizarProducto(id: string, nombre: string, categoriaId: string, precio: number): Promise<boolean> {
        const { error } = await this.supabase
            .from('productos_candy')
            .update({
                nombre,
                categoria_id: categoriaId,
                precio
            })
            .eq('id', id);

        if (error) {
            console.error('Error al actualizar el producto:', error);
            return false;
        }

        await this.cargarProductos();

        return true;
    }

    async eliminarProducto(id: string): Promise<boolean> {
        const { error } = await this.supabase
            .from('productos_candy')
            .delete()
            .eq('id', id);

        if (error) {
            console.error('Error al eliminar el producto:', error);
            return false;
        }

        await this.cargarProductos();

        return true;
    }

    // ======== Funciones para las categorias del candybar ========
    async crearCategoria(nombre: string): Promise<boolean> {
        const { error } = await this.supabase
            .from('categorias_candy')
            .insert({ nombre })
            .select();

        if (error) {
            console.error('Error al cargar una categoria: ', error);
            return false;
        }

        await this.cargarCategorias();

        return true;
    }

    async actualizarCategoria(id: string, nombre: string): Promise<boolean> {
        const { error } = await this.supabase
            .from('categorias_candy')
            .update({ nombre })
            .eq('id', id);

        if (error) {
            console.error('Error al actualizar la categoría:', error);
            return false;
        }

        await this.cargarCategorias();

        return true;
    }

    async eliminarCategoria(id: string): Promise<boolean> {
        const { error } = await this.supabase
        .from('categorias_candy')
        .delete()
        .eq('id', id);

        if (error) {
            console.error('Error al eliminar la categoría:', error);
            return false;
        }

        await this.cargarCategorias();

        return true;
    }

    

}
