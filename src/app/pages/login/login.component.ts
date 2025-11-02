import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { RouterModule } from '@angular/router'; // ✅ AGREGAR ESTO


@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, CommonModule, RouterModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  correo: string = '';
  contrasena: string = '';
  mensaje: string = '';
  isError: boolean = false;
  isLoading: boolean = false;

  constructor(
    private authService: AuthService,
    private router: Router
  ) { }

  onSubmit(): void {
    this.mensaje = '';
    
    if (!this.correo || !this.contrasena) {
      this.showMessage('Por favor completa todos los campos', true);
      return;
    }

    this.isLoading = true;

    this.authService.login(this.correo, this.contrasena).subscribe({
      next: (response) => {
        this.isLoading = false;
        console.log('Respuesta del login:', response);

        if (response.requires2FA) {
          this.showMessage('Credenciales correctas. Verificando 2FA...', false);
          localStorage.setItem('temp_correo_2fa', response.correo);
          
          setTimeout(() => {
            this.router.navigate(['/two-factor-verify'], {
              state: {
                correo: response.correo,
                metodo_2fa: response.metodo_2fa
              }
            });
          }, 1500);
        } else {
          // Guardar token y datos del usuario
          localStorage.setItem('token', response.token);
          localStorage.setItem('userEmail', response.usuario.correo);
          localStorage.setItem('userName', response.usuario.nombre);
          localStorage.setItem('userId', response.usuario.id);
          localStorage.setItem('isLoggedIn', 'true');
          
          this.showMessage('Inicio de sesión exitoso ✅', false);
          setTimeout(() => {
            this.router.navigate(['/dashboard']);
          }, 1500);
        }
      },
      error: (error) => {
        this.isLoading = false;
        console.error('Error en login:', error);
        const errorMsg = error.error?.message || 'Error al iniciar sesión';
        this.showMessage(errorMsg, true);
      }
    });
  }

  goToRegister(): void {
    this.router.navigate(['/register']);
  }

  private showMessage(msg: string, isError: boolean): void {
    this.mensaje = msg;
    this.isError = isError;
  }
}