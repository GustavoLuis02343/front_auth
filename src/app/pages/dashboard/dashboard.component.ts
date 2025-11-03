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
    if (!this.authService.isAuthenticated()) {
      this.router.navigate(['/login']);
      return;
    }

    this.usuario = this.authService.getUserData();
    console.log('Usuario:', this.usuario);
  }

  cambiarVista(vista: 'inicio' | 'seguridad'): void {
    this.vistaActual = vista;
  }

  logout(): void {
    this.authService.logout();
  }

  // ✅ MODIFICADO: Ir directo al QR de TOTP
  configurar2FA(): void {
    if (this.usuario?.correo) {
      this.router.navigate(['/two-factor-setup'], {
        state: { 
          correo: this.usuario.correo,
          metodoPreseleccionado: 'TOTP',
          saltarSeleccion: true
        }
      });
    }
  }
}