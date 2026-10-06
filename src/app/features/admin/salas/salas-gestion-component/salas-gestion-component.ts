import { Component, inject, OnInit } from '@angular/core';
import { SalaService } from '../../../../core/services/sala-service';
import { SalaInterface } from '../../../../core/models/sala.cine.interface';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

@Component({
  imports: [FormsModule, RouterLink],
  selector: 'app-salas-gestion-component',
  styleUrl: './salas-gestion-component.css',
  templateUrl: './salas-gestion-component.html',
})
export class SalasGestionComponent implements OnInit {

  salaService = inject(SalaService);

  nombreSalaNew = '';
  salaEditando: SalaInterface | null = null;
  nombreEditado = '';


  ngOnInit(): void {
    this.salaService.cargarSalas();
  }

  async crearSala(): Promise<void> {
    // Limpio bien el nombre para q no quede espacios si los hay
    const nombre = this.nombreSalaNew.trim();

    if (!nombre) {
      alert('Ingresá un nombre para la sala.');
      return;
    }

    const creada = await this.salaService.crearSala(nombre);

    if (!creada) {
      alert('No se pudo crear la sala');
      return;
    }

    this.nombreSalaNew = '';

    await this.salaService.cargarSalas();

    alert('Sala creada con éxito!!')
  }

  editarSala(sala: SalaInterface): void {

    this.salaEditando = sala;
    this.nombreEditado = sala.nombre;
  }

  cancelarEdicion(): void {

    this.salaEditando = null;
    this.nombreEditado = '';
  }

  async guardarEdicion(): Promise<void> {
    if (!this.salaEditando?.id) {
      return;
    }

    const nombre = this.nombreEditado.trim();

    if (!nombre) {
      alert('Ingresá un nombre para la sala.');
      return;
    }

    const actualizada =
      await this.salaService.actualizarSala(
        this.salaEditando.id,
        nombre
      );

    if (!actualizada) {
      alert('No se pudo actualizar la sala.');
      return;
    }

    this.salaEditando = null;
    this.nombreEditado = '';

    await this.salaService.cargarSalas();

    alert('Sala actualizada correctamente.');
  }

  async eliminarSala(id: string): Promise<void> {
    const confirmar = confirm('¿Estás seguro de que querés eliminar esta sala?');

    if (!confirmar) {
      return;
    }

    const eliminada = await this.salaService.eliminarSala(id);

    if (!eliminada) {
      alert('No se puede eliminar la sala porque tiene funciones asociadas.');
      return;
    }

    await this.salaService.cargarSalas();

    alert('Sala eliminada correctamente.');
  }
}
