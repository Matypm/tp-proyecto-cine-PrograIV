import { Component, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { PeliculaService } from '../../../../core/services/pelicula-service';
import { ActivatedRoute } from '@angular/router';

@Component({
  imports: [ReactiveFormsModule],
  selector: 'app-editar-pelicula-component',
  styleUrl: './editar-pelicula-component.css',
  templateUrl: './editar-pelicula-component.html',
})
export class EditarPeliculaComponent implements OnInit, OnDestroy {

  private peliculaServices = inject(PeliculaService);
  private fb = inject(FormBuilder);
  private peliculaService = inject(PeliculaService);
  private route = inject(ActivatedRoute);

  generosSeleccionados = signal<string[]>([]);
  imagenSeleccionada = signal<File | null>(null); // archivo nuevo que eligió el admin.
  imagenPreview = signal<string | null>(null); // URL temporal para mostrar ese archivo nuevo antes de subirlo.
  imagenActual = signal<string | null>(null); //URL que ya está guardada en Supabase.

  generos = this.peliculaService.generos;
  idPelicula!: string;

  formPeliculaEdicion = this.fb.group({
    nombre: ['', [Validators.required, Validators.minLength(2)]],
    sinopsis: ['', [Validators.required, Validators.minLength(10)]],
    duracion: [0, [Validators.required, Validators.min(30)]],
    edad_restriccion: [0, [Validators.required, Validators.min(0), Validators.max(18)]]
  });


  ngOnDestroy(): void {
    const preview = this.imagenPreview();

    if (preview) {
      URL.revokeObjectURL(preview);
    }
  }

  ngOnInit(): void {
    this.route.paramMap.subscribe(async params => {
      const id = params.get('id');

      if (!id) {
        return;
      }

      this.idPelicula = id;

      const pelicula = await this.peliculaService.obtenerPeliculaPorId(id);

      if (!pelicula) {
        return;
      }

      this.formPeliculaEdicion.patchValue({
        nombre: pelicula.nombre,
        sinopsis: pelicula.sinopsis,
        duracion: pelicula.duracion,
        edad_restriccion: pelicula.edad_restriccion
      });

      this.imagenActual.set(pelicula.imagen);

      this.generosSeleccionados.set(
        pelicula.pelicula_genero.map(relacion => relacion.genero_id)
      );
    });
  }

  seleccionarGenero(generoId: string): void {
    this.generosSeleccionados.update(generos => {

      if (generos.includes(generoId)) {
        return generos.filter(id => id !== generoId);
      }

      return [...generos, generoId];
    });
  }

  seleccionarImagen(event: Event): void {
    const input = event.target as HTMLInputElement;

    if (!input.files || input.files.length === 0) {
      return;
    }

    const archivo = input.files[0];

    this.imagenSeleccionada.set(archivo);

    const previewAnterior = this.imagenPreview();

    if (previewAnterior) {
      URL.revokeObjectURL(previewAnterior);
    }

    const nuevaPreview = URL.createObjectURL(archivo);

    this.imagenPreview.set(nuevaPreview);
  }

  async editarPelicula(): Promise<void> {

    if (this.formPeliculaEdicion.invalid) {
      this.formPeliculaEdicion.markAllAsTouched();
      return;
    }

    const pelicula = {
      nombre: this.formPeliculaEdicion.value.nombre!,
      sinopsis: this.formPeliculaEdicion.value.sinopsis!,
      duracion: this.formPeliculaEdicion.value.duracion!,
      edad_restriccion: this.formPeliculaEdicion.value.edad_restriccion!
    };

    const resultado = await this.peliculaService.actualizarPelicula(this.idPelicula, pelicula);

    if (!resultado) {
      return;
    }

    const generosActualizados =
      await this.peliculaService.actualizarGeneros(
        this.idPelicula,
        this.generosSeleccionados()
      );

    if (!generosActualizados) {
      return;
    }

    const nuevaImg = this.imagenSeleccionada();

    if(nuevaImg){
      const imgActualizada = await this.peliculaService.actualizarImagenPelicula(this.idPelicula, nuevaImg);
      
      if(!imgActualizada){
        return;
      }
    }

    alert('Película editada correctamente!');
  }

}
