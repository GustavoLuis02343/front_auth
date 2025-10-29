import { Component, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TwoFactorService } from '../../services/two-factor.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-two-factor-verify',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './two-factor-verify.component.html',
  styleUrls: ['./two-factor-verify.component.css']
})
export class TwoFactorVerifyComponent implements OnInit {
  correo: string = '';
  metodo2fa: string = 'TOTP';
  codigo: string = '';
  mensaje: string = '';
  isError: boolean = false;
  isLoading: boolean = false;

  constructor(
    private twoFactorService: TwoFactorService,
    private authService: AuthService,
    private router: Router
  ) { }

  ngOnInit(): void {
    // Obtener correo del state
    const navigation = this.router.getCurrentNavigation();
    this.correo = navigation?.extras?.state?.['correo'] || '';
    this.metodo2fa = navigation?.extras?.state?.['metodo_2fa'] || 'TOTP';

    // Si no hay correo en state, intentar obtenerlo del localStorage
    if (!this.correo) {
      this.correo = localStorage.getItem('temp_correo_2fa') || '';
    }

    // Si aún no hay correo, redirigir al login
    if (!this.correo) {
      console.error('No se encontró el correo para verificación 2FA');
      this.router.navigate(['/login']);
    }

    console.log('Correo para 2FA:', this.correo);
  }

  verificar(): void {
    if (!this.codigo || this.codigo.length !== 6) {
      this.showMessage('El código debe tener 6 dígitos', true);
      return;
    }

    this.isLoading = true;

    // Primero validar el código TOTP
    this.twoFactorService.validateTOTP(this.correo, this.codigo).subscribe({
      next: (response) => {
        if (response.valid) {
          // Si el código es válido, hacer login con 2FA
          this.authService.loginWith2FA(this.correo, this.codigo).subscribe({
            next: (loginResponse) => {
              this.isLoading = false;
              
              // Limpiar correo temporal
              localStorage.removeItem('temp_correo_2fa');
              
              this.showMessage('✅ Acceso concedido', false);
              setTimeout(() => {
                this.router.navigate(['/dashboard']);
              }, 1500);
            },
            error: (error) => {
              this.isLoading = false;
              console.error('Error en loginWith2FA:', error);
              this.showMessage('Error al iniciar sesión', true);
            }
          });
        }
      },
      error: (error) => {
        this.isLoading = false;
        console.error('Error en validateTOTP:', error);
        this.showMessage('❌ Código incorrecto', true);
      }
    });
  }

  private showMessage(msg: string, isError: boolean): void {
    this.mensaje = msg;
    this.isError = isError;
  }
}