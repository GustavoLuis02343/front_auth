import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { RecoveryService } from '../../services/recovery.service';

@Component({
  selector: 'app-verify-recovery-code',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './verify-recovery-code.component.html',
  styleUrls: ['./verify-recovery-code.component.css']
})
export class VerifyRecoveryCodeComponent implements OnInit, OnDestroy {
  verifyForm: FormGroup;
  isLoading = false;
  errorMessage = '';
  correo = '';
  timeLeft = 900; // 15 minutos en segundos
  timerInterval: any;

  constructor(
    private fb: FormBuilder,
    private recoveryService: RecoveryService,
    private router: Router
  ) {
    this.verifyForm = this.fb.group({
      codigo: ['', [Validators.required, Validators.pattern(/^[A-Z0-9]{4}-[A-Z0-9]{4}$/)]]
    });
  }

  ngOnInit(): void {
    // Recuperar correo del localStorage
    this.correo = localStorage.getItem('recovery_email') || '';
    
    if (!this.correo) {
      this.router.navigate(['/forgot-password']);
      return;
    }

    // Iniciar temporizador
    this.startTimer();
  }

  ngOnDestroy(): void {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
    }
  }

  startTimer(): void {
    this.timerInterval = setInterval(() => {
      this.timeLeft--;
      
      if (this.timeLeft <= 0) {
        clearInterval(this.timerInterval);
        this.errorMessage = 'El código ha expirado. Solicita uno nuevo.';
      }
    }, 1000);
  }

  formatTime(): string {
    const minutes = Math.floor(this.timeLeft / 60);
    const seconds = this.timeLeft % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }

  onSubmit(): void {
    if (this.verifyForm.invalid) {
      this.verifyForm.markAllAsTouched();
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    const codigo = this.verifyForm.value.codigo.toUpperCase();

    this.recoveryService.validateRecoveryCode(this.correo, codigo).subscribe({
      next: (response) => {
        this.isLoading = false;
        
        if (response.valid) {
          // Guardar código para el siguiente paso
          localStorage.setItem('recovery_code', codigo);
          
          // Redirigir a restablecer contraseña
          this.router.navigate(['/reset-password']);
        } else {
          this.errorMessage = response.message;
        }
      },
      error: (error) => {
        this.isLoading = false;
        this.errorMessage = error.error?.message || 'Código inválido o expirado';
      }
    });
  }

  resendCode(): void {
    this.router.navigate(['/forgot-password']);
  }

  // Formatear input automáticamente (XXXX-XXXX)
  onCodeInput(event: any): void {
    let value = event.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '');
    
    if (value.length > 4) {
      value = value.slice(0, 4) + '-' + value.slice(4, 8);
    }
    
    this.verifyForm.patchValue({ codigo: value }, { emitEvent: false });
  }

  get codigo() {
    return this.verifyForm.get('codigo');
  }
}