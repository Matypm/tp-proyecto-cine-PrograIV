import { Component, inject, signal, Signal } from '@angular/core';
import { PeliculaService } from '../../../../core/services/pelicula-service';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

@Component({
  imports: [ReactiveFormsModule],
  selector: 'app-crear-pelicula',
  styleUrl: './crear-pelicula.css',
  templateUrl: './crear-pelicula.html',
})
export class CrearPelicula {

  private fb = inject(FormBuilder);
  private peliculaService = inject(PeliculaService);
  imagenSeleccionada = signal<File | null>(null);
  imagenPreview = signal<string | null>(null);
  generosSeleccionados = signal<string[]>([]);

  generos = this.peliculaService.generos;

  formPeliculaNueva = this.fb.group({
    nombre: ['', [Validators.required, Validators.minLength(2)]],
    sinopsis: ['', [Validators.required, Validators.minLength(10)]],
    duracion: [0, [Validators.required, Validators.min(30)]],
    edad_restriccion: [0, [Validators.required, Validators.min(0), Validators.max(18)]],
  })

   seleccionarImagen(event: Event): void {

    const input = event.target as HTMLInputElement;

    if (!input.files || input.files.length === 0) {
      return;
    }

    const archivo = input.files[0];

    // Guardamos el archivo
    this.imagenSeleccionada.set(archivo);

    // Liberamos la preview anterior
    const previewAnterior = this.imagenPreview();

    if (previewAnterior) {
      URL.revokeObjectURL(previewAnterior);
    }

    // Creamos una URL temporal para mostrar la imagen
    const nuevaPreview = URL.createObjectURL(archivo);

    this.imagenPreview.set(nuevaPreview);
  }

  seleccionarGenero(generoId: string): void {

    this.generosSeleccionados.update(generos => {
        if (generos.includes(generoId)) {
            return generos.filter(id => id !== generoId);
        }

        return [...generos, generoId];
    });

     console.log(this.generosSeleccionados());
  }


async crearPelicula() {

    console.log('ENTRÓ A CREAR PELÍCULA');
    if (this.formPeliculaNueva.invalid) {
      console.log('FORMULARIO INVÁLIDO');
      this.formPeliculaNueva.markAllAsTouched();
      return;
    }

    if (!this.imagenSeleccionada()) {
      console.log('NO HAY IMAGEN');
      console.error('No se seleccionó ninguna imagen');
      return;
    }

    console.log('FORMULARIO E IMAGEN OK');

    // Aca creo la estructura de la pelicula con las variables
    // para decirle q no son nulos los valores 
    const pelicula = {
        nombre: this.formPeliculaNueva.value.nombre!,
        sinopsis: this.formPeliculaNueva.value.sinopsis!,
        duracion: this.formPeliculaNueva.value.duracion!,
        edad_restriccion: this.formPeliculaNueva.value.edad_restriccion!
    };

    try {
        const resultado = await this.peliculaService.crearPelicula(
            pelicula,
            this.imagenSeleccionada()!
        );

        if (!resultado) {
            return;
        }

        await this.peliculaService.agregarGeneros(
            resultado.id!,
            this.generosSeleccionados()
        );

        console.log('Película creada:', resultado);
        alert('¡Película creada con éxito!');

    } catch (error) {
        console.error('Error al crear la película:', error);
    }
  }



}
