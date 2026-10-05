export interface CompraInterface {
  id?: string;
  usuario_id: string | null;
  nombre: string;
  apellido: string;
  email: string;
  codigo_qr: string;
  retirado: boolean;
  created_at?: string;
}