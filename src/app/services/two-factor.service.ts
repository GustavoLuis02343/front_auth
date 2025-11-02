import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment'; // ✅ AGREGAR IMPORT

@Injectable({
  providedIn: 'root'
})
export class TwoFactorService {
  // ✅ CAMBIAR: De hardcoded a environment
  private apiUrl = `${environment.apiUrl}/2fa`;

  constructor(private http: HttpClient) { }

  /**
   * Configurar TOTP (Google Authenticator)
   */
  setupTOTP(correo: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/setup-totp`, { correo });
  }

  /**
   * Verificar código TOTP durante configuración
   */
  verifyTOTP(correo: string, token: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/verify-totp`, { correo, token });
  }

  /**
   * Validar código TOTP durante login
   */
  validateTOTP(correo: string, token: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/validate-totp`, { correo, token });
  }

  /**
   * Configurar 2FA por EMAIL
   */
  setupEmail(correo: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/setup-email`, { correo });
  }

  /**
   * Verificar código EMAIL durante configuración
   */
  verifyEmail(correo: string, codigo: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/verify-email`, { correo, codigo });
  }

  /**
   * Validar código EMAIL durante login
   */
  validateEmail(correo: string, codigo: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/validate-email`, { correo, codigo });
  }
}