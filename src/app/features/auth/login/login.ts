import { Component, inject, signal } from '@angular/core';
import { AuthService } from '../../../core/services/auth-service';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';


@Component({
  imports: [ReactiveFormsModule, RouterLink],
  selector: 'app-login',
  styleUrl: './login.css',
  templateUrl: './login.html',
})
export class Login {

  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router)

  loginForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required]]
  })

  isLoading = signal(false);
  errorMessage = signal<string | null>(null);

  async onSubmit(){
    if(this.loginForm.invalid) return;

    this.isLoading.set(true);
    this.errorMessage.set(null);

    const {email, password} = this.loginForm.value;

    try{
      const {error} = await this.authService.signIn(email!, password!)
      
      if(error) throw error;

      this.router.navigate(['/home']);
      } catch(error:any){
        this.errorMessage.set(error.message || 'Error al iniciar sesion')
      } finally{
        this.isLoading.set(false);
      }
    }
}
