import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TwoFactorService } from '../../services/two-factor.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-two-factor-setup',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './two-factor-setup.component.html',
  styleUrls: ['./two-factor-setup.component.css']
})
export class TwoFactorSetupComponent implements OnInit {
  correo: string = '';
  metodoSeleccionado: string = '';
  qrCodeUrl: string = '';
  secreto: string = '';
  codigoVerificacion: string = '';
  mensaje: string = '';
  isError: boolean = false;
  paso: number = 1;

  constructor(
    private twoFactorService: TwoFactorService,
    private authService: AuthService,
    private router: Router
  ) { }

  ngOnInit(): void {
    // Intentar obtener correo del state
    const navigation = this.router.getCurrentNavigation();
    this.correo = navigation?.extras?.state?.['correo'] || '';
    
    // Si no hay correo en state, obtenerlo del usuario actual
    if (!this.correo) {
      const userData = this.authService.getUserData();
      this.correo = userData?.correo || '';
    }
    
    // Si aún no hay correo, redirigir al dashboard
    if (!this.correo) {
      alert('No se pudo obtener el correo. Inicia sesión nuevamente.');
      this.router.navigate(['/dashboard']);
    }
  }

  seleccionarMetodo(metodo: string): void {
    this.metodoSeleccionado = metodo;

    if (metodo === 'TOTP') {
      this.configurarTOTP();
    } else if (metodo === 'EMAIL' || metodo === 'SMS') {
      this.showMessage('Este método estará disponible próximamente', false);
    } else if (metodo === 'NINGUNO') {
      this.router.navigate(['/dashboard']);
    }
  }

  configurarTOTP(): void {
    this.twoFactorService.setupTOTP(this.correo).subscribe({
      next: (response) => {
        this.qrCodeUrl = response.qrCode;
        this.secreto = response.secret;
        this.paso = 2;
      },
      error: (error) => {
        this.showMessage('Error al configurar TOTP', true);
        console.error(error);
      }
    });
  }

  irAVerificacion(): void {
    this.paso = 3;
  }

  verificarCodigo(): void {
    if (!this.codigoVerificacion || this.codigoVerificacion.length !== 6) {
      this.showMessage('El código debe tener 6 dígitos', true);
      return;
    }

    this.twoFactorService.verifyTOTP(this.correo, this.codigoVerificacion).subscribe({
      next: (response) => {
        this.showMessage('✅ 2FA activado correctamente', false);
        setTimeout(() => {
          this.router.navigate(['/dashboard']);
        }, 2000);
      },
      error: (error) => {
        this.showMessage('❌ Código incorrecto', true);
      }
    });
  }

  omitir2FA(): void {
    this.router.navigate(['/dashboard']);
  }

  private showMessage(msg: string, isError: boolean): void {
    this.mensaje = msg;
    this.isError = isError;
  }
}