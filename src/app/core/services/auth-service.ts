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
    currentPerfil = signal<UsuarioInterface | null>(null);
    perfilCargado = signal(false);

    private authInicializada: Promise<void>;

    constructor() {
        this.authInicializada = this.initAuthSession() // aca se "prenderia" la sesión

    }

    private async initAuthSession(): Promise<void> {

        const { data: { session } } =
            await this.supabase.auth.getSession();

        this.currentSession.set(session);
        this.currentUser.set(session?.user ?? null);

        if (session?.user) {
            await this.cargarPerfil(session.user.id);
        }

        this.supabase.auth.onAuthStateChange((_event, session) => {

            this.currentSession.set(session);
            this.currentUser.set(session?.user ?? null);

            if (session?.user) {
                this.cargarPerfil(session.user.id);
            } else {
                this.currentPerfil.set(null);
                this.perfilCargado.set(false);
            }
        });
    }

    async esperarInicializacion() {
        await this.authInicializada;
    }

    async cargarPerfil(id: string) { // cargarPerfil me sirve para poder leer los datos de la tabla usuarios
        const { data, error } = await this.supabase
            .from('usuarios')
            .select('*')
            .eq('id', id)
            .single();

        if (error) {
            console.error('Error al cargar tu perfil', error)
            return;
        }
        else {
            this.currentPerfil.set(data)
            console.log('Perfil obtenido exitosamente!')
        }
        this.perfilCargado.set(true);
    }

    async signUp(email: string, password: string, nombre: string, apellido: string, fecha_nacimiento: string) {
        return this.supabase.auth.signUp({
            email, password,
            options: {
                data: {
                    nombre: nombre,
                    apellido: apellido,
                    fecha_nacimiento: fecha_nacimiento
                }
            }
        });
    }

    async signIn(email: string, password: string) {
        const resultado = await this.supabase.auth.signInWithPassword({ email, password })

        if (resultado.data.user) {
            await this.cargarPerfil(resultado.data.user.id)
        }

        return resultado;
    }

    async signOut() {
        return this.supabase.auth.signOut();
    }
}   
