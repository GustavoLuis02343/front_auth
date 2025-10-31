import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

interface RecoveryResponse {
  message: string;
  correo?: string;
}

interface ValidationResponse {
  valid: boolean;
  message: string;
}

interface ResetResponse {
  message: string;
}

@Injectable({
  providedIn: 'root'
})
export class RecoveryService {
  private apiUrl = environment.apiUrl || 'http://localhost:4000/api';

  constructor(private http: HttpClient) {}

  /**
   * Solicitar código de recuperación
   */
  requestRecoveryCode(correo: string): Observable<RecoveryResponse> {
    return this.http.post<RecoveryResponse>(
      `${this.apiUrl}/recovery/request-code`,
      { correo }
    );
  }

  /**
   * Validar código de recuperación
   */
  validateRecoveryCode(correo: string, codigo: string): Observable<ValidationResponse> {
    return this.http.post<ValidationResponse>(
      `${this.apiUrl}/recovery/validate-code`,
      { correo, codigo }
    );
  }

  /**
   * Restablecer contraseña
   */
  resetPassword(correo: string, codigo: string, nuevaContrasena: string): Observable<ResetResponse> {
    return this.http.post<ResetResponse>(
      `${this.apiUrl}/recovery/reset-password`,
      { correo, codigo, nuevaContrasena }
    );
  }
}