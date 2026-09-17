export type RolUsuario = 'cliente' | 'admin' | 'empleado';

export interface UsuarioInterface {
    id?: string;              // viene de auth.users (uuid)
    nombre: string;
    apellido: string;
    email: string;
    fecha_nacimiento: string; // con formato "YYYY-MM-DD", ej: "2007-03-15"
    rol: RolUsuario;
    puntos: number;           
    credito: number;          
}