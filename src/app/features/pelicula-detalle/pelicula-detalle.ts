import { Component, computed, effect, inject, input, signal } from '@angular/core';
import { PeliculaService } from '../../core/services/pelicula-service';
import { Router } from '@angular/router';
import { FuncionesService } from '../../core/services/funciones-service';
import { CompraService } from '../../core/services/compra-service';
import { AuthService } from '../../core/services/auth-service';

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
  private compraService = inject(CompraService);
  private router = inject(Router);
  private authService = inject(AuthService);

  currentUser = this.authService.currentUser;
  currentPerfil = this.authService.currentPerfil;

  diaSeleccionado = signal('');
  funcionSeleccionada = signal<string | null>(null);
  mensajeEdad = signal('');

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

  formatosDisponibles = computed(() => {
    const formatos = this.funciones().map(funcion => funcion.formato.toUpperCase());
    return [...new Set(formatos)]; // Set elimina los repetidos
  });

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
    const fecha = new Date(fechaHora);

    if (isNaN(fecha.getTime())) {
      return 'INVALID DATE';
    }

    return fecha.toLocaleTimeString('es-AR', {
      timeZone: 'America/Argentina/Buenos_Aires',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });
  }

  formatearFormaDeFecha(fechaHora: string): { dia: string; fecha: string } {
    const fecha = new Date(fechaHora);

    if (isNaN(fecha.getTime())) {
      return {
        dia: 'INVALID DATE',
        fecha: 'INVALID DATE'
      };
    }

    return {
      dia: fecha.toLocaleDateString('es-AR', {
        timeZone: 'America/Argentina/Buenos_Aires',
        weekday: 'short'
      }).toUpperCase(),

      fecha: fecha.toLocaleDateString('es-AR', {
        timeZone: 'America/Argentina/Buenos_Aires',
        day: '2-digit',
        month: '2-digit'
      })
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

  comprarEntrada(funcionId: string): void {

    if (!this.puedeComprar()) {
      this.mensajeEdad.set(
        `No cumplís con la edad mínima de ${this.pelicula()?.edad_restriccion} años para esta película.`
      );
      return;
    }

    this.mensajeEdad.set('');

    this.compraService.funcionSeleccionada.set(funcionId);
    this.router.navigate(['/compra', funcionId]);
  }

  puedeComprar(): boolean {
    const pelicula = this.pelicula();

    if (!pelicula) {
      return false;
    }

    // Sin restriccion
    if (pelicula.edad_restriccion === 0) {
      return true;
    }

    // User anonimo
    if (!this.currentUser()) {
      return true;
    }

    // Usuario registrado
    const perfil = this.currentPerfil();

    if (!perfil?.fecha_nacimiento) {
      return false;
    }

    const edad = this.calcularEdad(perfil.fecha_nacimiento);

    return edad >= pelicula.edad_restriccion;
  }

  calcularEdad(fechaNacimiento: string): number {
    const nacimiento = new Date(fechaNacimiento);
    const hoy = new Date();

    let edad = hoy.getFullYear() - nacimiento.getFullYear();

    const mes = hoy.getMonth() - nacimiento.getMonth();

    if (
      mes < 0 ||
      (mes === 0 && hoy.getDate() < nacimiento.getDate())
    ) {
      edad--;
    }

    return edad;
  }



  // Navegación programática — volver al listado
  volver(): void {
    this.router.navigate(['/home']);
    this.diaSeleccionado.set('');
  }


}
