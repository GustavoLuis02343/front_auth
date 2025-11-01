import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TwoFactorService } from '../../services/two-factor.service';
import { AuthService } from '../../services/auth.service';
import { HttpClient } from '@angular/common/http'; // NUEVO

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

  private apiUrl = 'http://localhost:3000/api'; // NUEVO

  constructor(
    private twoFactorService: TwoFactorService,
    private authService: AuthService,
    private router: Router,
    private http: HttpClient 
  ) { }

  ngOnInit(): void {
    // Intentar obtener correo del state
    const navigation = this.router.getCurrentNavigation();
    this.correo = navigation?.extras?.state?.['correo'] || '';
    
    if (!this.correo) {
      const userData = this.authService.getUserData();
      this.correo = userData?.correo || '';
    }
    
    if (!this.correo) {
      alert('No se pudo obtener el correo. Inicia sesión nuevamente.');
      this.router.navigate(['/dashboard']);
    }
  }

  seleccionarMetodo(metodo: string): void {
    this.metodoSeleccionado = metodo;

    if (metodo === 'TOTP') {
      this.configurarTOTP();
    } else if (metodo === 'EMAIL') {
      this.configurarEmail(); // NUEVO
    } else if (metodo === 'SMS') {
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

  configurarEmail(): void {
    this.http.post(`${this.apiUrl}/email/setup-email`, {
      correo: this.correo
    }).subscribe({
      next: (response: any) => {
        this.showMessage('✅ ' + response.message, false);
        this.paso = 3;
      },
      error: (error) => {
        console.error('Error al configurar EMAIL:', error);
        this.showMessage('❌ Error al enviar código', true);
      }
    });
  }

  verificarEmail(): void {
    this.http.post(`${this.apiUrl}/email/verify-email`, {
      correo: this.correo,
      codigo: this.codigoVerificacion
    }).subscribe({
      next: (response: any) => {
        this.showMessage('✅ ' + response.message, false);
        setTimeout(() => {
          this.router.navigate(['/dashboard']);
        }, 2000);
      },
      error: (error) => {
        console.error('Error al verificar EMAIL:', error);
        this.showMessage('❌ Código incorrecto', true);
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

    // MODIFICADO: Verificar según método
    if (this.metodoSeleccionado === 'TOTP') {
      this.verificarTOTP();
    } else if (this.metodoSeleccionado === 'EMAIL') {
      this.verificarEmail(); 
    }
  }

  verificarTOTP(): void {
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