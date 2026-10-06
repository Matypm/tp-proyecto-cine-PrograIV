import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CandybarService } from '../../../../core/services/candybar-service';

@Component({
  imports: [FormsModule],
  selector: 'app-gestion-candybar',
  styleUrl: './gestion-candybar.css',
  templateUrl: './gestion-candybar.html',
})
export class GestionCandybar {

  private candybarService = inject(CandybarService);

  nombre = signal('');
  categoriaId = signal('');
  precio = signal<number | null>(null);
  editando = signal(false);
  productoEditandoId = signal<string | null>(null);

  nombreCategoria = signal('');
  editandoCategoria = signal(false);
  idCategoriaActual = signal<string | null>(null);

  categorias = this.candybarService.categorias;
  productos = this.candybarService.productos;

  async guardarProducto(): Promise<void> {

    if (!this.nombre() || !this.categoriaId() || this.precio() === null || this.precio()! <= 0) {
      alert('Completá todos los campos correctamente.');
      return;
    }

    if (this.editando()) {
      const id = this.productoEditandoId();

      if (!id) {
        alert('No se encontró el producto a editar.');
        return;
      }

      const prodActualizado = await this.candybarService.actualizarProducto(id, this.nombre(), this.categoriaId(), this.precio()!);

      if (!prodActualizado) {
        alert('No se pudo actualizar el producto.');
        return;
      }

      alert('Producto actualizado correctamente.');

    }
    else {

      const prodCreado = await this.candybarService.crearProducto(this.nombre(), this.categoriaId(), this.precio()!);

      if (!prodCreado) {
        alert('No se pudo crear el producto.');
        return;
      }

      alert('Producto creado correctamente.');
    }

    this.limpiarFormulario();
  }

  editarProducto(id: string): void {
    const producto = this.candybarService
      .productos()
      .find(p => p.id === id);

    if (!producto) {
      return;
    }

    this.nombre.set(producto.nombre);
    this.categoriaId.set(producto.categoria_id);
    this.precio.set(producto.precio);

    this.productoEditandoId.set(id);
    this.editando.set(true);
  }

  async eliminarProducto(id: string): Promise<void> {
    const confirmar = confirm('¿Estás seguro de que querés eliminar este producto?');

    if (!confirmar) {
      return;
    }

    const eliminado =
      await this.candybarService.eliminarProducto(id);

    if (!eliminado) {
      alert('No se pudo eliminar el producto.');
      return;
    }

    alert('Producto eliminado correctamente.');
  }

  limpiarFormulario(): void {
    this.nombre.set('');
    this.categoriaId.set('');
    this.precio.set(null);

    this.editando.set(false);
    this.productoEditandoId.set(null);
  }

  // Funciones para crud de categoria
  async guardarCategoria(): Promise<void> {

    const nombreCatSinEspacio = this.nombreCategoria().trim();

    if (!nombreCatSinEspacio) {
      alert('Ingresá un nombre para la categoría.');
      return;
    }

    if (this.editandoCategoria()) {
      const id = this.idCategoriaActual();

      if (!id) {
        alert('No se encontró la categoría.');
        return;
      }

      const catActualizada =
        await this.candybarService.actualizarCategoria(
          id,
          nombreCatSinEspacio
        );

      if (!catActualizada) {
        alert('No se pudo actualizar la categoría.');
        return;
      }

      alert('Categoría actualizada correctamente.');

    }
    else {
      const catCreada =
        await this.candybarService.crearCategoria(
          nombreCatSinEspacio
        );

      if (!catCreada) {
        alert('No se pudo crear la categoría.');
        return;
      }

      alert('Categoría creada correctamente.');
    }

    this.limpiarCategoria();
  }

  editarCategoria(id: string): void {
    const categoria = this.candybarService
      .categorias()
      .find(c => c.id === id);

    if (!categoria) {
      return;
    }

    this.nombreCategoria.set(categoria.nombre);
    this.idCategoriaActual.set(id);
    this.editandoCategoria.set(true);
  }

  async eliminarCategoria(id: string): Promise<void> {
    const confirmar = confirm('¿Estás seguro de que querés eliminar esta categoría?');

    if (!confirmar) {
      return;
    }

    const eliminada = await this.candybarService.eliminarCategoria(id);

    if (!eliminada) {
      alert('No se pudo eliminar la categoría, puede tener productos vinculados');
      return;
    }

    alert('Categoría eliminada correctamente.');
  }

  limpiarCategoria(): void {
    this.nombreCategoria.set('');
    this.editandoCategoria.set(false);
    this.idCategoriaActual.set(null);
  }

}
