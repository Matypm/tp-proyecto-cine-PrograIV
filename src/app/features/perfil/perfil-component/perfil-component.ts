import { Component, inject } from '@angular/core';
import { MisCompras } from '../mis-compras/mis-compras';
import { AuthService } from '../../../core/services/auth-service';

@Component({
  imports: [MisCompras],
  selector: 'app-perfil-component',
  styleUrl: './perfil-component.css',
  templateUrl: './perfil-component.html',
})
export class PerfilComponent {
   private authService = inject(AuthService);

  currentPerfil = this.authService.currentPerfil;
}
