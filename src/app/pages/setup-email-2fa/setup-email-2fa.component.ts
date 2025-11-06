import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../services/auth.service';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-setup-email-2fa',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './setup-email-2fa.component.html',
  styleUrls: ['./setup-email-2fa.component.css']
})
export class SetupEmail2FAComponent implements OnInit {
  correo: string = '';
  codigo: string = '';
  paso: number = 1; // 1=info, 2=verificar código
  mensaje: string = '';
  isError: boolean = false;
  cargando: boolean = false;

  private apiUrl = environment.apiUrl;

  constructor(
    private http: HttpClient,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Obtener correo del usuario
    const userData = this.authService.getUserData();
    this.correo = userData?.correo || '';

    if (!this.correo) {
      alert('No se pudo obtener tu correo');
      this.router.navigate(['/dashboard']);
    }
  }

  // PASO 1: Enviar código de configuración
  enviarCodigoConfiguracion(): void {
    this.cargando = true;
    this.mensaje = '';

    this.http.post(`${this.apiUrl}/gmail-2fa/configurar`, { correo: this.correo })
.subscribe({
      next: (response: any) => {
        console.log('✅ Código enviado:', response);
        this.showMessage('✅ Código enviado a tu correo', false);
        this.paso = 2; // Ir al paso de verificación
        this.cargando = false;
      },
      error: (error) => {
        console.error('❌ Error al enviar código:', error);
        this.showMessage('❌ Error al enviar el código', true);
        this.cargando = false;
      }
    });
  }

  // PASO 2: Verificar código y activar Email 2FA
  verificarYActivar(): void {
    if (!this.codigo || this.codigo.trim().length === 0) {
      this.showMessage('Por favor ingresa el código', true);
      return;
    }

    this.cargando = true;

    this.http.post(`${this.apiUrl}/gmail-2fa/verificar`, {
      correo: this.correo,
      codigo: this.codigo.trim()
    }).subscribe({
      next: (response: any) => {
        console.log('✅ Email 2FA activado:', response);
        this.showMessage('✅ Email 2FA activado correctamente', false);
        this.cargando = false;

        setTimeout(() => {
          this.router.navigate(['/dashboard']);
        }, 2000);
      },
      error: (error) => {
        console.error('❌ Error al verificar código:', error);
        this.showMessage('❌ Código inválido', true);
        this.cargando = false;
        this.codigo = '';
      }
    });
  }

  volver(): void {
    this.router.navigate(['/dashboard']);
  }

  private showMessage(msg: string, isError: boolean): void {
    this.mensaje = msg;
    this.isError = isError;
  }
}