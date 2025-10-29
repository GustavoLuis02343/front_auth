import { Component } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent {
  nombre: string = '';
  email: string = '';
  password: string = '';
  errorMessage: string = '';
  successMessage: string = '';
  isLoading: boolean = false;

  constructor(
    private authService: AuthService,
    private router: Router
  ) { }

  onRegister(): void {
    this.errorMessage = '';
    this.successMessage = '';

    if (!this.nombre || !this.email || !this.password) {
      this.errorMessage = 'Todos los campos son obligatorios';
      return;
    }

    if (this.password.length < 8) {
      this.errorMessage = 'La contraseña debe tener al menos 8 caracteres';
      return;
    }

    this.isLoading = true;

    this.authService.register(this.nombre, this.email, this.password).subscribe({
      next: (response) => {
        this.isLoading = false;
        console.log('✅ Registro exitoso:', response);
        this.successMessage = 'Registro exitoso. Redirigiendo al login...';
        
        setTimeout(() => {
          this.router.navigate(['/login']);
        }, 2000);
      },
      error: (error) => {
        this.isLoading = false;
        console.error('❌ Error en registro:', error);
        
        if (error.status === 400) {
          this.errorMessage = 'El correo ya está registrado';
        } else {
          this.errorMessage = error.error?.message || 'Error en registro';
        }
      }
    });
  }
}