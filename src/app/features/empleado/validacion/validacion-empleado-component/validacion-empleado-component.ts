import { Component, inject, signal } from '@angular/core';
import { EmpleadoService } from '../../../../core/services/empleado-service';
import { CompraConEntradaInterface } from '../../../../core/models/compra-entrada.inteface';
import { DatePipe } from '@angular/common';
import { ZXingScannerModule } from '@zxing/ngx-scanner';
import { BarcodeFormat } from '@zxing/library';

@Component({
  imports: [DatePipe, ZXingScannerModule],
  selector: 'app-validacion-empleado-component',
  styleUrl: './validacion-empleado-component.css',
  templateUrl: './validacion-empleado-component.html',
})
export class ValidacionEmpleadoComponent {

  private empleadoService = inject(EmpleadoService);

  codigo = signal('');
  compra = signal<CompraConEntradaInterface | null>(null);
  mensaje = signal('');

  escaneando = signal(false);
  formatosPermitidos = [BarcodeFormat.QR_CODE];


  buscarCompra() {
    const codigo = this.codigo().trim();

    if (!codigo) {
      this.mensaje.set('Ingresá un código.');
      return;
    }

    this.buscarConCodigo(codigo);
  }

  async buscarConCodigo(codigo: string) {
    this.mensaje.set('');

    const compra = await this.empleadoService.buscarCompraPorCodigo(codigo);

    if (!compra) {
      this.compra.set(null);
      this.mensaje.set('No se encontró ninguna compra con ese código.');
      return;
    }

    this.compra.set(compra);
  }

  async validarEntrada() {
    const compra = this.compra();

    if (!compra) return;

    if (compra.entrada_validada) {
      this.mensaje.set('Esta entrada ya fue validada.');
      return;
    }

    const entradaValidada = await this.empleadoService.validarEntrada(compra.id!);

    if (!entradaValidada) {
      this.mensaje.set('No se pudo validar la entrada.');
      return;
    }

    this.compra.update(compraActual => {
      if (!compraActual) return null;

      return {
        ...compraActual,
        entrada_validada: true
      };
    });

    this.mensaje.set('Entrada validada correctamente.');
  }

  async retirarCandybar() {
    const compra = this.compra();

    if (!compra) return;

    if (compra.candybar_retirado) {
      this.mensaje.set('El Candy Bar ya fue retirado.');
      return;
    }

    const candyRetirado = await this.empleadoService.retirarCandybar(compra.id!);

    if (!candyRetirado) {
      this.mensaje.set('No se pudo registrar el retiro del Candy Bar.');
      return;
    }

    this.compra.update(compraActual => {
      if (!compraActual) return null;

      return {
        ...compraActual,
        candybar_retirado: true
      };
    });

    this.mensaje.set('Candy Bar entregado correctamente.');
  }

  tieneEntrada(): boolean {
    return (this.compra()?.entradas?.length ?? 0) > 0;
  }

  tieneCandybar(): boolean {
    return (this.compra()?.compras_productos?.length ?? 0) > 0;
  }

  qrConsumido(): boolean {
    const compra = this.compra();

    if (!compra) return false;

    const entradaConsumida = !this.tieneEntrada() || compra.entrada_validada;

    const candyConsumido = !this.tieneCandybar() || compra.candybar_retirado;

    return entradaConsumida && candyConsumido;
  }

  codigoEscaneado(codigo: string) {

    if (!codigo) return;

    this.codigo.set(codigo);
    this.escaneando.set(false);

    this.buscarConCodigo(codigo);
  }

  abrirEscaner() {
    this.mensaje.set('');
    this.escaneando.set(true);
  }

  cerrarEscaner() {
    this.escaneando.set(false);
  }

  limpiar() {
    this.codigo.set('');
    this.compra.set(null);
    this.mensaje.set('');
  }


}
