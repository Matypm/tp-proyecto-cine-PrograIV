import { inject, Injectable, signal } from '@angular/core';
import { SupabaseService } from './supabase-service';
import { User, Session } from '@supabase/supabase-js';
import { UsuarioInterface } from '../models/usuario.interface';


@Injectable({
    providedIn: 'root'
})
export class AuthService {
    private supabase = inject(SupabaseService).client // injecto mi servicio de supabase

    currentUser = signal<User | null>(null);
    currentSession = signal<Session | null>(null);
    currentPerfil = signal <UsuarioInterface | null>(null);

    constructor(){
        
        this.initAuthSession() // aca se "prenderia" la sesión
    }

    private initAuthSession(){
        this.supabase.auth.getSession().then(({data:{session}}) => {
            this.currentSession.set(session);
            this.currentUser.set(session?.user ?? null); // si hay sesión, guardá el usuario de esa sesión; si no hay sesión, guardá null
        });

        this.supabase.auth.onAuthStateChange((_event, session) => {
            this.currentSession.set(session);
            this.currentUser.set(session?.user ?? null);
        });
    }

    async cargarPerfil(id: string){ // cargarPerfil me sirve para poder leer los datos de la tabla usuarios
        const {data, error} = await this.supabase
        .from('usuarios')
        .select('*')
        .eq('id', id)
        .single();

        if(error){
            console.error('Error al cargar tu perfil', error)
            return;
        }
        else{
            this.currentPerfil.set(data)
            console.log('Perfil obtenido exitosamente!')
        }
    }

    async signUp(email: string, password: string, nombre: string, apellido: string, fecha_nacimiento: string){
        return this.supabase.auth.signUp({email, password,
            options:{
                data:{
                    nombre: nombre,
                    apellido: apellido,
                    fecha_nacimiento: fecha_nacimiento
                }
            }
        });
    }

    async signIn(email: string, password: string){
        const resultado = await this.supabase.auth.signInWithPassword({email, password})

        if(resultado.data.user){
            await this.cargarPerfil(resultado.data.user.id)
        }

        return resultado;
    }

    async signOut(){
        return this.supabase.auth.signOut();
    }
}   
