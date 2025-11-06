import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  usuario: any = null;
  tiene2FA: boolean = false;
  vistaActual: 'inicio' | 'seguridad' = 'inicio';

  constructor(
    public authService: AuthService,
    private router: Router
  ) { }

  ngOnInit(): void {
    console.log('🔍 Verificando autenticación...');
    
    if (!this.authService.isAuthenticated()) {
      console.log('❌ Usuario no autenticado, redirigiendo...');
      this.router.navigate(['/login']);
      return;
    }

    this.cargarDatosUsuario();
  }

  cargarDatosUsuario(): void {
    this.usuario = this.authService.getUserData();
    console.log('👤 Datos del usuario cargados:', this.usuario);

    if (!this.usuario || !this.usuario.correo) {
      console.error('❌ No se pudo obtener el correo del usuario');
      alert('Error al cargar tus datos. Por favor, inicia sesión nuevamente.');
      this.authService.logout();
    }
  }

  cambiarVista(vista: 'inicio' | 'seguridad'): void {
    this.vistaActual = vista;
  }

  logout(): void {
    this.authService.logout();
  }

  // ✅ Configurar TOTP (Google Authenticator)
  configurar2FA(): void {
    if (!this.usuario?.correo) {
      alert('No se pudo obtener tu correo');
      return;
    }

    this.router.navigate(['/two-factor-setup'], {
      state: { 
        correo: this.usuario.correo,
        metodoPreseleccionado: 'TOTP',
        saltarSeleccion: true
      }
    });
  }

  // ✅ Configurar Email 2FA (Brevo)
  configurarEmail2FA(): void {
    console.log('📧 Configurando Email 2FA...');

    if (!this.usuario?.correo) {
      console.error('❌ No hay correo disponible');
      alert('No se pudo obtener tu correo. Por favor, inicia sesión nuevamente.');
      this.authService.logout();
      return;
    }

    const correo = this.usuario.correo.trim();
    console.log('✅ Correo encontrado:', correo);

    // ✅ Ir a la configuración de Email 2FA (NO a verificación de login)
    this.router.navigate(['/setup-email-2fa']);
  }
}