import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, AbstractControl, ValidationErrors } from '@angular/forms';
import { Router } from '@angular/router';
import { RecoveryService } from '../../services/recovery.service';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.css']
})
export class ResetPasswordComponent implements OnInit {
  resetForm: FormGroup;
  isLoading = false;
  errorMessage = '';
  successMessage = '';
  correo = '';
  codigo = '';
  showPassword = false;
  showConfirmPassword = false;
  passwordStrength: 'weak' | 'medium' | 'strong' = 'weak';

  constructor(
    private fb: FormBuilder,
    private recoveryService: RecoveryService,
    private router: Router
  ) {
    this.resetForm = this.fb.group({
      nuevaContrasena: ['', [
        Validators.required,
        Validators.minLength(8),
        this.passwordComplexityValidator
      ]],
      confirmarContrasena: ['', [Validators.required]]
    }, {
      validators: this.passwordMatchValidator
    });
  }

  ngOnInit(): void {
    // Recuperar datos del localStorage
    this.correo = localStorage.getItem('recovery_email') || '';
    this.codigo = localStorage.getItem('recovery_code') || '';

    if (!this.correo || !this.codigo) {
      this.router.navigate(['/forgot-password']);
      return;
    }

    // Observar cambios en la contraseña para calcular fortaleza
    this.resetForm.get('nuevaContrasena')?.valueChanges.subscribe(value => {
      this.calculatePasswordStrength(value);
    });
  }

  // Validador personalizado de complejidad
  passwordComplexityValidator(control: AbstractControl): ValidationErrors | null {
    const value = control.value;
    if (!value) return null;

    const hasUpperCase = /[A-Z]/.test(value);
    const hasLowerCase = /[a-z]/.test(value);
    const hasNumber = /\d/.test(value);

    const valid = hasUpperCase && hasLowerCase && hasNumber;
    return valid ? null : { complexity: true };
  }

  // Validador de coincidencia de contraseñas
  passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
    const password = control.get('nuevaContrasena');
    const confirmPassword = control.get('confirmarContrasena');

    if (!password || !confirmPassword) return null;

    return password.value === confirmPassword.value ? null : { mismatch: true };
  }

  calculatePasswordStrength(password: string): void {
    if (!password) {
      this.passwordStrength = 'weak';
      return;
    }

    let strength = 0;
    
    // Criterios de fortaleza
    if (password.length >= 8) strength++;
    if (password.length >= 12) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/\d/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++; // Caracteres especiales

    if (strength <= 2) {
      this.passwordStrength = 'weak';
    } else if (strength <= 4) {
      this.passwordStrength = 'medium';
    } else {
      this.passwordStrength = 'strong';
    }
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  toggleConfirmPasswordVisibility(): void {
    this.showConfirmPassword = !this.showConfirmPassword;
  }

  onSubmit(): void {
    if (this.resetForm.invalid) {
      this.resetForm.markAllAsTouched();
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';
    this.successMessage = '';

    const nuevaContrasena = this.resetForm.value.nuevaContrasena;

    this.recoveryService.resetPassword(this.correo, this.codigo, nuevaContrasena).subscribe({
      next: (response) => {
        this.isLoading = false;
        this.successMessage = response.message;
        
        // Limpiar localStorage
        localStorage.removeItem('recovery_email');
        localStorage.removeItem('recovery_code');
        
        // Redirigir al login después de 3 segundos
        setTimeout(() => {
          this.router.navigate(['/login']);
        }, 3000);
      },
      error: (error) => {
        this.isLoading = false;
        this.errorMessage = error.error?.message || 'Error al restablecer la contraseña';
      }
    });
  }

  get nuevaContrasena() {
    return this.resetForm.get('nuevaContrasena');
  }

  get confirmarContrasena() {
    return this.resetForm.get('confirmarContrasena');
  }

  get passwordsMatch(): boolean {
    return !this.resetForm.hasError('mismatch');
  }
}