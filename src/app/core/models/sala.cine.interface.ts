export interface SalaInterface {
    id?: string;
    nombre: string // Sala 3
}

export interface ButacaInterface {
    id?: string;
    sala_id: string;
    fila: string // de la A a la T (20 filas)
    columna: number // modelo de columaas es de 4 20 4
}