import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { RecoveryService } from '../../services/recovery.service';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.css']
})
export class ForgotPasswordComponent {
  forgotForm: FormGroup;
  isLoading = false;
  errorMessage = '';
  successMessage = '';

  constructor(
    private fb: FormBuilder,
    private recoveryService: RecoveryService,
    private router: Router
  ) {
    this.forgotForm = this.fb.group({
      correo: ['', [Validators.required, Validators.email]]
    });
  }

  onSubmit(): void {
    if (this.forgotForm.invalid) {
      this.forgotForm.markAllAsTouched();
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';
    this.successMessage = '';

    const correo = this.forgotForm.value.correo;

    this.recoveryService.requestRecoveryCode(correo).subscribe({
      next: (response) => {
        this.isLoading = false;
        this.successMessage = response.message;
        
        // Guardar correo en localStorage para los siguientes pasos
        localStorage.setItem('recovery_email', correo);
        
        // Redirigir a verificación de código después de 2 segundos
        setTimeout(() => {
          this.router.navigate(['/verify-recovery-code']);
        }, 2000);
      },
      error: (error) => {
        this.isLoading = false;
        this.errorMessage = error.error?.message || 'Error al enviar el código. Intenta de nuevo.';
      }
    });
  }

  get correo() {
    return this.forgotForm.get('correo');
  }
}