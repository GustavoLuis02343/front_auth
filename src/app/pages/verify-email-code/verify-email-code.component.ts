import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-verify-email-code',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './verify-email-code.component.html',
  styleUrls: ['./verify-email-code.component.css']
})
export class VerifyEmailCodeComponent implements OnInit, OnDestroy {
  correo: string = '';
  codigo: string = '';
  mensaje: string = '';
  isError: boolean = false;
  tiempoRestante: number = 900;
  intervalo: any;
  cargando: boolean = false;

  constructor(
    private authService: AuthService, 
    private router: Router
  ) {}

  ngOnInit(): void {
  console.log('📧 Iniciando verificación de Email 2FA...');
  
  const state = history.state;
  const storedEmail = localStorage.getItem('temp_correo_2fa');
  const userData = this.authService.getUserData();

  // 🔹 Prioridad: state → localStorage → datos del usuario
  this.correo = state?.correo || storedEmail || userData?.correo || '';

  if (!this.correo) {
    console.warn('⚠️ No se pudo obtener el correo. Redirigiendo al dashboard...');
    this.router.navigate(['/dashboard']);
    return;
  }

  console.log('✅ Correo obtenido para verificación:', this.correo);

  // Inicia temporizador y envía el código automáticamente
  this.iniciarTemporizador();

  this.authService.resendLoginCode(this.correo).subscribe({
    next: () => console.log('📨 Código enviado correctamente a', this.correo),
    error: (err) => console.error('❌ Error al enviar código:', err)
  });
}


  ngOnDestroy(): void {
    if (this.intervalo) {
      clearInterval(this.intervalo);
    }
  }

  enviarCodigoInicial(): void {
    this.authService.resendLoginCode(this.correo).subscribe({
      next: () => {
        console.log('📧 Código enviado automáticamente');
        this.showMessage('📧 Código enviado a tu correo', false);
        setTimeout(() => this.mensaje = '', 3000);
      },
      error: (err) => {
        console.error('❌ Error enviando código:', err);
        this.showMessage('Error al enviar el código', true);
      }
    });
  }

  iniciarTemporizador(): void {
    this.intervalo = setInterval(() => {
      if (this.tiempoRestante > 0) {
        this.tiempoRestante--;
      } else {
        clearInterval(this.intervalo);
        this.showMessage('⏰ El código ha expirado. Solicita uno nuevo.', true);
      }
    }, 1000);
  }

  get tiempoFormateado(): string {
    const min = Math.floor(this.tiempoRestante / 60);
    const seg = this.tiempoRestante % 60;
    return `${min.toString().padStart(2, '0')}:${seg.toString().padStart(2, '0')}`;
  }

  verificarCodigo(): void {
    if (!this.codigo || this.codigo.trim().length === 0) {
      this.showMessage('Por favor ingresa el código recibido', true);
      return;
    }

    this.cargando = true;
    this.authService.verifyLoginCode({ 
      correo: this.correo, 
      codigo: this.codigo.trim() 
    }).subscribe({
      next: (res) => {
        console.log('✅ Verificación exitosa:', res);
        localStorage.removeItem('temp_correo_2fa');

        if (res.token) {
          this.authService.saveToken(res.token);
        }
        if (res.usuario) {
          this.authService.saveUserData(res.usuario);
        }

        this.showMessage('✅ Código verificado correctamente', false);
        this.cargando = false;

        setTimeout(() => {
          this.router.navigate(['/dashboard']);
        }, 1500);
      },
      error: (err) => {
        console.error('❌ Error en verificación:', err);
        const msg = err.error?.message || 'Código inválido o expirado';
        this.showMessage(msg, true);
        this.cargando = false;
        this.codigo = '';
      }
    });
  }

  reenviarCodigo(): void {
    if (this.cargando) return;

    this.cargando = true;
    this.showMessage('Reenviando código...', false);
    
    //this.authService.resendLoginCode(this.correo)
    this.authService.resendLoginCode(this.correo).subscribe({
      next: () => {
        this.showMessage('✅ Nuevo código enviado a tu correo', false);
        this.tiempoRestante = 900;
        this.cargando = false;
        this.codigo = '';
        
        setTimeout(() => {
          if (this.mensaje === '✅ Nuevo código enviado a tu correo') {
            this.mensaje = '';
          }
        }, 3000);
      },
      error: (err) => {
        console.error('❌ Error al reenviar:', err);
        this.showMessage('❌ No se pudo reenviar el código', true);
        this.cargando = false;
      }
    });
  }

  volver(): void {
    localStorage.removeItem('temp_correo_2fa');
    this.router.navigate(['/dashboard']);
  }

  private showMessage(msg: string, isError: boolean): void {
    this.mensaje = msg;
    this.isError = isError;
  }
}