import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TwoFactorService } from '../../services/two-factor.service';
import { AuthService } from '../../services/auth.service';
import { HttpClient } from '@angular/common/http';

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

  private apiUrl = 'http://localhost:4000/api'; 

  constructor(
    private twoFactorService: TwoFactorService,
    private authService: AuthService,
    private router: Router,
    private http: HttpClient,
    private route: ActivatedRoute
  ) { 
 const navigation = this.router.currentNavigation();
    console.warn(navigation);
  
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
    // Obtener correo del state

     //const navigation = this.router.getCurrentNavigation();
    //const state = navigation.extras.state as {example: string};
    //this.example = state.example;
      
     
  }

  verificar(): void {
    if (!this.codigo || this.codigo.length !== 6) {
      this.showMessage('El código debe tener 6 dígitos', true);
      return;
    }

    this.isLoading = true;

    console.log('🔍 Verificando con método:', this.metodo2fa);

    if (this.metodo2fa === 'EMAIL') {
      console.log('📧 Usando validación EMAIL');
      this.verificarEmail();
    } else {
      console.log('🔢 Usando validación TOTP');
      this.verificarTOTP();
    }
  }

  verificarEmail(): void {
    console.log('📧 Llamando a /api/email/validate-email');
    console.log('📦 Body:', { correo: this.correo, codigo: this.codigo });
    
    this.http.post(`${this.apiUrl}/email/validate-email`, {
      correo: this.correo,
      codigo: this.codigo
    }).subscribe({
      next: (response: any) => {
        console.log('✅ Respuesta validate-email:', response);
        
        if (response.valid) {
          this.completarLogin();
        } else {
          this.isLoading = false;
          this.showMessage('❌ Código incorrecto', true);
        }
      },
      error: (error) => {
        this.isLoading = false;
        console.error('❌ Error al validar EMAIL:', error);
        this.showMessage('❌ Código incorrecto', true);
      }
    });
  }

  verificarTOTP(): void {
    console.log('🔢 Llamando a validateTOTP del service');
    
    this.twoFactorService.validateTOTP(this.correo, this.codigo).subscribe({
      next: (response) => {
        console.log('✅ Respuesta TOTP:', response);
        
        if (response.valid) {
          this.completarLogin();
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