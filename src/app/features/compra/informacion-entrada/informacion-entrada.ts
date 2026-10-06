import { Component, DestroyRef, inject, signal } from '@angular/core';
import { CompraService } from '../../../core/services/compra-service';
import { ActivatedRoute, Router } from '@angular/router';
import { SupabaseService } from '../../../core/services/supabase-service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CompraConEntradaInterface } from '../../../core/models/compra-entrada.inteface';
import { QRCodeComponent } from 'angularx-qrcode';
import jsPDF from 'jspdf';
import QRCode from 'qrcode';

@Component({
  imports: [QRCodeComponent],
  selector: 'app-informacion-entrada',
  styleUrl: './informacion-entrada.css',
  templateUrl: './informacion-entrada.html',
})
export class InformacionEntrada {

  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private destroyRef = inject(DestroyRef);
  private compraService = inject(CompraService);

  compraObtenida = signal<CompraConEntradaInterface | null>(null);


  constructor() {
    this.cargarCompra();
  }

  async cargarCompra(){
    this.route.paramMap.pipe(takeUntilDestroyed(this.destroyRef))
    .subscribe(async params => {
      const compraId = params.get('compraId');

      if(!compraId){
        console.error('No se selecciono una compra');
        return;
      }

      const compra = await this.compraService.traerInfoCompra(compraId);

      if (!compra) {
        return;
      }

      console.log('Compra obtenida: ', compra);
      this.compraObtenida.set(compra);
      console.log(this.compraObtenida())
    });
  }

  formatearFechaYHora(fechaHora: string): {fecha: string, hora: string}{
    const fecha = new Date(fechaHora); // convierte la hora q le pasa fechaHora en un objeto de tipo Date 

    // toLocaleTimeString() significa, básicamente:
    // "Dame la hora de este Date, pero formateada según una determinada configuración regional
    const hora = fecha.toLocaleTimeString('es-AR', {
      hour: '2-digit', // es para q la hora se muestre asi: 18, y no asi: 6
      minute: '2-digit', // lo mismo aca, es para q los minuto se muestren asi: 05, y no asi: 5
      hour12: false // es para q se muestre el formato 24hs, pq si por ej: quiero poner 18:00, sin el false se muestra asi 06:00 p.m.
    });

    const fechaFormateada = fecha.toLocaleDateString('es-AR', {
      day: '2-digit',
      month: '2-digit'
    })

    return {
      fecha: fechaFormateada,
      hora: hora
    };
  }

async descargarPDF() {
  const compra = this.compraObtenida();

  if (!compra || compra.entradas.length === 0) {
    return;
  }

  const pdf = new jsPDF();

  const entrada = compra.entradas[0];
  const pelicula = entrada.funciones.peliculas;
  const fechaHora = this.formatearFechaYHora(
    entrada.funciones.fecha_hora
  );

  let y = 20;

  // Título
  pdf.setFontSize(22);
  pdf.text('LA12 CINEMA', 20, y);

  y += 10;

  pdf.setFontSize(14);
  pdf.text('Comprobante de entrada', 20, y);

  // QR
  const qr = await QRCode.toDataURL(compra.codigo_qr);

  pdf.addImage(qr, 'PNG', 140, 15, 50, 50);

  // Película
  y += 20;

  pdf.setFontSize(16);
  pdf.text('Película', 20, y);

  y += 8;

  pdf.setFontSize(12);
  pdf.text(pelicula.nombre, 20, y);

  // Fecha y horario
  y += 12;

  pdf.text(`Fecha: ${fechaHora.fecha}`, 20, y);

  y += 7;

  pdf.text(`Horario: ${fechaHora.hora} hs`, 20, y);

  // Formato e idioma
  y += 7;

  pdf.text(
    `Formato: ${entrada.funciones.formato}`,
    20,
    y
  );

  y += 7;

  pdf.text(
    `Idioma: ${entrada.funciones.idioma}`,
    20,
    y
  );

  // Butacas
  y += 12;

  pdf.setFontSize(14);
  pdf.text('Butacas', 20, y);

  y += 8;

  pdf.setFontSize(12);

  const butacas = compra.entradas
    .map(entrada =>
      `${entrada.butacas.fila}${entrada.butacas.columna}`
    )
    .join(' · ');

  pdf.text(butacas, 20, y);

  // Datos del comprador
  y += 15;

  pdf.setFontSize(14);
  pdf.text('Datos del comprador', 20, y);

  y += 8;

  pdf.setFontSize(12);

  pdf.text(`Nombre: ${compra.nombre}`, 20, y);

  y += 7;

  pdf.text(`Apellido: ${compra.apellido}`, 20, y);

  y += 7;

  pdf.text(`Email: ${compra.email}`, 20, y);

  // Candybar
  if (compra.compras_productos.length > 0) {

    y += 15;

    pdf.setFontSize(14);
    pdf.text('Candybar', 20, y);

    y += 8;

    pdf.setFontSize(12);

    for (const producto of compra.compras_productos) {

      const total =
        producto.precio_unidad * producto.cantidad;

      pdf.text(
        `${producto.cantidad} x ${producto.productos_candy.nombre} - $${total}`,
        20,
        y
      );

      y += 7;
    }
  }

  // Código de entrada
  y += 12;

  pdf.setFontSize(10);

  pdf.text(
    `Código de entrada: ${compra.codigo_qr}`,
    20,
    y
  );

  // Descargar
  pdf.save(`entrada-${compra.id}.pdf`);
}


  volverAlInicio(){
    this.compraService.limpiarCompra();
    this.router.navigate(['/home'])
  }
}
