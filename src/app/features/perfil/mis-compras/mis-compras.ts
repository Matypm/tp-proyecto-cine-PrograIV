import { Component, inject, signal } from '@angular/core';
import { CompraService } from '../../../core/services/compra-service';
import { AuthService } from '../../../core/services/auth-service';

@Component({
  imports: [],
  selector: 'app-mis-compras',
  styleUrl: './mis-compras.css',
  templateUrl: './mis-compras.html',
})
export class MisCompras {
   private compraService = inject(CompraService);
  private authService = inject(AuthService);

  compras = signal<any[]>([]);
  comprasProximas = signal<any[]>([]);
  comprasVistas = signal<any[]>([]);

  async ngOnInit() {
    const usuario = this.authService.currentUser();

    if (!usuario) {
      return;
    }

    const compras = await this.compraService.obtenerComprasUsuario(usuario.id);

    this.compras.set(compras);
  }

  

  formatearFechaYHora(fecha: string): { fecha: string, hora: string } {
    const fechaObj = new Date(fecha);

    return {
      fecha: fechaObj.toLocaleDateString('es-AR'),
      hora: fechaObj.toLocaleTimeString('es-AR', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
      })
    };
  }

  esCompraProxima(compra: any): boolean {

    if (compra.cancelada) {
        return false;
    }

    const fechaFuncion = new Date(
        compra.entradas[0].funciones.fecha_hora
    );

    const ahora = new Date();

    return fechaFuncion > ahora;
  }

  esCompraVista(compra: any): boolean {
    const fechaFuncion = new Date(compra.entradas[0].funciones.fecha_hora);
    const ahora = new Date();

    return fechaFuncion <= ahora;
  } 

  totalCompra(compra: { entradas: { precio: number }[] }): number {
    return compra.entradas.reduce((total, entrada) => total + entrada.precio, 0);
  }

  async cancelarCompra(compra: any) {

    const usuario = this.authService.currentUser();

    if (!usuario) return;

    const cancelada = await this.compraService.cancelarCompra(
        compra.id,
        usuario.id
    );

    if (cancelada) {

        alert('Compra cancelada correctamente.');

        const comprasActualizadas =
            await this.compraService.obtenerComprasUsuario(usuario.id);

        this.compras.set(comprasActualizadas);

    } else {

        alert('No se pudo cancelar la compra.');
    }
  }
}
