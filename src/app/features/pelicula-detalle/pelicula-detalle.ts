import { Component, computed, effect, inject, input, signal } from '@angular/core';
import { PeliculaService } from '../../core/services/pelicula-service';
import { Router } from '@angular/router';
import { FuncionesService } from '../../core/services/funciones-service';

@Component({
  imports: [],
  selector: 'app-pelicula-detalle',
  styleUrl: './pelicula-detalle.css',
  templateUrl: './pelicula-detalle.html',
})
export class PeliculaDetalle {

  id = input.required<string>();

  private peliculaService = inject(PeliculaService);
  private funcionesService = inject(FuncionesService);
  private router = inject(Router);

  diaSeleccionado = signal('');

  // computed() obtiene la película correspondiente al ID de la ruta.
  // Si las películas del servicio cambian, este computed se actualiza.
  pelicula = computed(() => {
    const todasLasPeliculas = this.peliculaService.peliculas();
    return todasLasPeliculas.find(p => p.id === this.id());
  });

  funciones = computed(() => {
    return this.funcionesService.funciones(); // No hace falta q haga lo de abajo pq en la consuta del FuncionesService ya lo filtro
    // return funcionesDePelicula.filter(p => p.pelicula_id === this.id());
  });

  funcionesDelDia = computed(() => {
    const dia = this.diaSeleccionado();

    // Acá filter() empieza a recorrer una por una las funciones.
    return this.funciones().filter(funcion => { 
      // Se formatean las fechas y se comparan con el dia del Signal
      return this.formatearFormaDeFecha(funcion.fecha_hora).fecha === dia; //
    })
  })

  constructor() {
    effect(() => {
      const peliculaId = this.id();
      this.funcionesService.cargarFuncionesPorPelicula(peliculaId);
    });

    effect(() => {
      console.log('Funciones de la película:', this.funciones());
    });

    effect(() => {
        const funciones = this.funciones();

        // Si tengo funciones cargadas y todavía no tengo ningún día seleccionado
        if (funciones.length > 0 && !this.diaSeleccionado()) {
            const primerDia = this.formatearFormaDeFecha(
                funciones[0].fecha_hora
            ).fecha;

            this.diaSeleccionado.set(primerDia);
        }
    });
  }

  formatearDuracion(minutos: number): string {
    const horas = Math.floor(minutos / 60);
    const minutosRestantes = minutos % 60;

    return `${horas}h ${minutosRestantes}m`;
  }

  formatearFormaDeHora(fechaHora: string): string {
    const fecha = new Date(fechaHora); // convierte la hora q le pasa fechaHora en un objeto de tipo Date 

    // toLocaleTimeString() significa, básicamente:
    // "Dame la hora de este Date, pero formateada según una determinada configuración regional
    return fecha.toLocaleTimeString('es-AR', {
      hour: '2-digit', // es para q la hora se muestre asi: 18, y no asi: 6
      minute: '2-digit', // lo mismo aca, es para q los minuto se muestren asi: 05, y no asi: 5
      hour12: false // es para q se muestre el formato 24hs, pq si por ej: quiero poner 18:00, sin el false se muestra asi 06:00 p.m.
    });
  }

  formatearFormaDeFecha(fechaHora: string): {dia: string, fecha: string} {
    const fecha = new Date(fechaHora);

    const dia = fecha.toLocaleDateString('es-AR', {
      weekday: 'short'
    }).toUpperCase();

    const fechaFormateada = fecha.toLocaleDateString('es-AR', {
      day: '2-digit',
      month: '2-digit'
    })

    return {
      dia: dia,
      fecha: fechaFormateada
    };
  }

  diasDisponibles = computed(() => {
    // Agarramos las funciones que tenemos cargadas desde Supabase
    const funciones = this.funciones();

    // map() recorre todas las funciones y transforma cada una en su fecha.
    // funciones:
    // 18:00 → 25 /09   |
    // 21:00 → 25 /09   |   A las 3 las transforma en ["vie, 25/09", "vie, 25/09", "sáb, 26/09"]
    // 18: 30 → 26 /09  |
    const fechas = funciones.map(funcion =>
      this.formatearFormaDeFecha(funcion.fecha_hora) // Recorre todos los elementos del array y transformá cada uno
    );

    const fechasUnicas = fechas.filter((fecha, i, array) => // Recorre el array y conserva los elementos segun la logica
      i === array.findIndex(f => // Busca la posición del primer elemento que coincida
        f.fecha === fecha.fecha
      )
    );

    return fechasUnicas; // Este es el resultado que quiero que tenga diasDisponibles
  });



  // Navegación programática — volver al listado
  volver(): void {
    this.router.navigate(['/home']);
    this.diaSeleccionado.set('');
  }


}
