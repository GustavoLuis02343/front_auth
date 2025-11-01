import { Component } from '@angular/core';
import { NavigationExtras, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { RouterModule } from '@angular/router';

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
        console.log('Respuesta del login:', response);

        if (response.requires2FA) {
          console.log('2FA requerido. Método:', response.metodo_2fa);
          localStorage.setItem('temp_correo_2fa', response.correo);
          
          // ============= NUEVO: SI ES EMAIL, ENVIAR CÓDIGO =============
          if (response.metodo_2fa === 'EMAIL') {
            this.showMessage('Credenciales correctas. Enviando código...', false);
            
            this.authService.sendEmailCode(response.correo).subscribe({
              next: (emailResponse) => {
                this.isLoading = false;
                console.log('Código enviado:', emailResponse);
                this.showMessage('✅ Código enviado a tu correo', false);
                
                  const navigationExtras: NavigationExtras = {state: {
                      correo: response.correo,
                      metodo_2fa: response.metodo_2fa
                    }};
                setTimeout(() => {

                  
                  this.router.navigate(['two-factor-verify'], navigationExtras);
                }, 1500);
              },
              error: (error) => {
                this.isLoading = false;
                console.error('Error al enviar código:', error);
                this.showMessage('❌ Error al enviar código', true);
              }
            });
          } else {
            // ============= TOTP: NO ENVIAR CÓDIGO =============
            this.isLoading = false;
            this.showMessage('Credenciales correctas. Verificando 2FA...', false);
            
            setTimeout(() => {
              this.router.navigate(['/two-factor-verify'], {
                state: {
                  correo: response.correo,
                  metodo_2fa: response.metodo_2fa
                }
              });
            }, 1500);
          }
        } else {
          // ============= SIN 2FA: LOGIN DIRECTO =============
          this.isLoading = false;
          
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