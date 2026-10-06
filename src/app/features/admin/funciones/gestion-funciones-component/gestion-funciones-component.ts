import { Component, inject, OnInit, signal } from '@angular/core';
import { FuncionesService } from '../../../../core/services/funciones-service';
import { PeliculasInterface } from '../../../../core/models/pelicula.interface';
import { UpperCasePipe } from '@angular/common';
import { FormatoPelicula, FuncionInterface, IdiomaPelicula } from '../../../../core/models/funcion.interface';

@Component({
  imports: [UpperCasePipe],
  selector: 'app-gestion-funciones-component',
  styleUrl: './gestion-funciones-component.css',
  templateUrl: './gestion-funciones-component.html',
})
export class GestionFuncionesComponent implements OnInit {

  funcionesService = inject(FuncionesService);

  funciones = this.funcionesService.funciones;
  cargando = this.funcionesService.cargando;

  peliculas = signal<PeliculasInterface[]>([]);
  peliculaSeleccionada = signal('');
  fechaHora = signal('');
  formato = signal<FormatoPelicula | ''>('');
  idioma = signal<IdiomaPelicula | ''>('');
  editando = signal(false);
  funcionEditandoId = signal<string | null>(null);

  ngOnInit(): void {
    this.cargarDatos();
  }

  async cargarDatos(): Promise<void> {
    await this.funcionesService.cargarTodasLasFunciones();

    const peliculas =
      await this.funcionesService.obtenerPeliculas();

    this.peliculas.set(peliculas);
  }

  async crearFuncion(): Promise<void> {
    if (!this.peliculaSeleccionada() || !this.fechaHora() || !this.formato() || !this.idioma()) {
      alert('Completá todos los campos.');
      return;
    }

    // EDITAR
    if (this.editando()) {

      const funcionId = this.funcionEditandoId();

      if (!funcionId) {
        alert('No se encontró la función a editar.');
        return;
      }

      const actualizada = await this.funcionesService.actualizarFuncion(
        funcionId,
        this.peliculaSeleccionada(),
        this.fechaHora(),
        this.formato() as FormatoPelicula,
        this.idioma() as IdiomaPelicula
      );

      if (!actualizada) {
        alert('No se pudo actualizar la función.');
        return;
      }

      alert('Función actualizada correctamente.');

    } else {

      // CREAR
      const creada = await this.funcionesService.crearFuncion(
        this.peliculaSeleccionada(),
        this.fechaHora(),
        this.formato() as FormatoPelicula,
        this.idioma() as IdiomaPelicula
      );

      if (!creada) {
        alert('No se pudo crear la función.');
        return;
      }

      alert('Función creada correctamente.');
    }

    // Limpiar formulario
    this.peliculaSeleccionada.set('');
    this.fechaHora.set('');
    this.formato.set('');
    this.idioma.set('');

    this.editando.set(false);
    this.funcionEditandoId.set(null);

    await this.funcionesService.cargarTodasLasFunciones();
  }

  editarFuncion(funcion: FuncionInterface): void {

    this.editando.set(true);
    this.funcionEditandoId.set(funcion.id!);

    this.peliculaSeleccionada.set(funcion.pelicula_id);

    const fecha = new Date(funcion.fecha_hora);

    const fechaFormateada = fecha.toLocaleString('es-AR', {
      timeZone: 'America/Argentina/Buenos_Aires',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });

    this.fechaHora.set(fechaFormateada.replace(',', ''));

    this.formato.set(funcion.formato);
    this.idioma.set(funcion.idioma);
  }

  async eliminarFuncion(id: string): Promise<void> {

    const confirmar = confirm('¿Estás seguro de que querés eliminar esta función?');

    if (!confirmar) {
      return;
    }

    const eliminada =
      await this.funcionesService.eliminarFuncion(id);

    if (!eliminada) {
      alert('No se pudo eliminar la función.');
      return;
    }

    alert('Función eliminada correctamente.');

    await this.funcionesService.cargarTodasLasFunciones();
  }

  formatearFecha(fechaHora: string): string {
    const fecha = new Date(fechaHora);

    return fecha.toLocaleDateString('es-AR', {
      timeZone: 'America/Argentina/Buenos_Aires',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  }

  formatearHora(fechaHora: string): string {
    const fecha = new Date(fechaHora);

    return fecha.toLocaleTimeString('es-AR', {
      timeZone: 'America/Argentina/Buenos_Aires',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });
  }

}
