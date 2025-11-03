import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
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
    private router: Router,
    private route: ActivatedRoute
  ) { 
    const navigation = this.router.getCurrentNavigation();
    console.warn('Navigation state:', navigation);
  
    this.correo = navigation?.extras?.state?.['correo'] || '';
    this.metodo2fa = navigation?.extras?.state?.['metodo_2fa'] || 'TOTP';

    if (!this.correo) {
      this.correo = localStorage.getItem('temp_correo_2fa') || '';
    }

    // Si aún no hay correo, redirigir al login
    if (!this.correo) {
      console.error('No se encontró el correo para verificación 2FA');
      this.router.navigate(['/login']);
    }

    console.log('✅ Correo para 2FA:', this.correo);
    console.log('✅ Método 2FA:', this.metodo2fa);
  }

  ngOnInit(): void {
    // Ya se obtuvo el correo en el constructor
  }

  verificar(): void {
    if (!this.codigo || this.codigo.length !== 6) {
      this.showMessage('El código debe tener 6 dígitos', true);
      return;
    }

    this.isLoading = true;

    console.log('🔍 Verificando con método:', this.metodo2fa);

    // Solo usar TOTP, ya que Email 2FA no está implementado en el backend
    this.verificarTOTP();
  }

  verificarTOTP(): void {
    console.log('🔢 Llamando a validateTOTP del service');
    
    this.twoFactorService.validateTOTP(this.correo, this.codigo).subscribe({
      next: (response) => {
        console.log('✅ Respuesta TOTP:', response);
        
        if (response.valid) {
          this.completarLogin();
        } else {
          this.isLoading = false;
          this.showMessage('❌ Código incorrecto', true);
        }
      },
      error: (error) => {
        this.isLoading = false;
        console.error('❌ Error en validateTOTP:', error);
        this.showMessage('❌ Código incorrecto', true);
      }
    });
  }

  completarLogin(): void {
    console.log('🔐 Completando login con 2FA...');
    
    this.authService.loginWith2FA(this.correo, this.codigo).subscribe({
      next: (loginResponse) => {
        console.log('✅ Login completado:', loginResponse);
        this.isLoading = false;
        
        localStorage.removeItem('temp_correo_2fa');
        
        this.showMessage('✅ Acceso concedido', false);
        setTimeout(() => {
          this.router.navigate(['/dashboard']);
        }, 1500);
      },
      error: (error) => {
        this.isLoading = false;
        console.error('❌ Error en loginWith2FA:', error);
        this.showMessage('Error al iniciar sesión', true);
      }
    });
  }

  private showMessage(msg: string, isError: boolean): void {
    this.mensaje = msg;
    this.isError = isError;
  }
}