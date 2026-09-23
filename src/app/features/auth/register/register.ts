import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth-service';
import { SupabaseService } from '../../../core/services/supabase-service';


@Component({
  imports: [ReactiveFormsModule, RouterLink],
  selector: 'app-register',
  styleUrl: './register.css',
  templateUrl: './register.html',
})
export class Register {
  private fb = inject(FormBuilder)
  private supabase = inject(SupabaseService).client;
  private authService = inject(AuthService)
  private router = inject(Router)

  registerForm = this.fb.group({
    nombre: ['', [Validators.required]],
    apellido: ['', [Validators.required]],
    email: ['', [Validators.required, Validators.email]],
    password: ['',[Validators.required, Validators.minLength(6)]],
    fecha_nacimiento: ['', [Validators.required, Validators.pattern(/^\d{4}-\d{2}-\d{2}$/)]]
  })

  isLoading = signal(false);
  errorMessage = signal<string | null>(null);
  succesMessage = signal<string | null>(null);

  async registrarUsuario(){
    if(this.registerForm.invalid) return;

    this.isLoading.set(true);
    this.errorMessage.set(null);
    this.succesMessage.set(null);

    const {nombre, apellido, email, password, fecha_nacimiento} = this.registerForm.value;

    try{
      // ACA se crea la cuenta en Auth
      const {data: dataAuth, error: errorAuth} = await this.authService.signUp(email!, password!, nombre!, apellido!, fecha_nacimiento!)
      
      if(errorAuth) throw errorAuth;

      if(dataAuth.user?.identities?.length === 0){
        this.errorMessage.set('Este email ya esta registrado')
        return;
      }
  
      // ACA se crea la cuenta en mi tabla Usuarios
      // const { error: errorUsuario } = await this.supabase
      // .from('usuarios')
      // .insert([{
      //   id: dataAuth.user!.id,
      //   nombre,
      //   apellido,
      //   email,
      //   fecha_nacimiento,
      //   rol: 'cliente'
      // }])

      // if(errorUsuario) throw errorUsuario;
      
      // // configuro el cupon para q sea de bienvenida
      // const {data: configCupon, error: errorConfig} = await this.supabase // tiene esta forma configCupon = { porcentaje_descuento: 20 }
      // .from('configuracion_cupones')
      // .select('porcentaje_descuento')
      // .eq('tipo', 'bienvenida')
      // .single();

      // if(errorConfig){
      //   console.error('Ocurrio un error al leer la configuracion del cupon', errorConfig)
      // }

      // const {error: errorCupon} = await this.supabase
      //       .from('cupones')
      //       .insert([{
      //           usuario_id: dataAuth.user!.id,
      //           tipo: 'bienvenida',
      //           porcentaje_descuento: configCupon?.porcentaje_descuento ?? 20 // aca el ?. significa q si el configCupon tiene como valor null o undefined que por defecto se le aplique el valor 20
      //       }]);

      //   if(errorCupon) throw errorCupon;

        // // 4. Actualizar la signal del perfil
        // await this.authService.cargarPerfil(dataAuth.user!.id); // el cargarPerfil hacia un select a la tabla usuarios para ver los datos de mi perfil

        this.succesMessage.set("Registro exitoso, confirme su email para confirmar su cuenta!!");
        this.registerForm.reset();

      } catch(error:any){
        this.errorMessage.set(error.message || 'Error al iniciar sesion')
      } finally{
        this.isLoading.set(false);
      }
    }



    
}
