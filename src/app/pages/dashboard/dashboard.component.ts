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

  constructor(
    public authService: AuthService,
    private router: Router
  ) { }

  ngOnInit(): void {
    // Verificar si está autenticado
    if (!this.authService.isAuthenticated()) {
      this.router.navigate(['/login']);
      return;
    }

    // Obtener datos del usuario
    this.usuario = this.authService.getUserData();
    console.log('Usuario:', this.usuario);
  }

  logout(): void {
    this.authService.logout();
  }

  configurar2FA(): void {
    if (this.usuario && this.usuario.correo) {
      this.router.navigate(['/two-factor-setup'], {
        state: { correo: this.usuario.correo }
      });
    } else {
      alert('No se pudo obtener el correo del usuario');
    }
  }
}