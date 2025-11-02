import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Router } from '@angular/router';
import { environment } from '../../environments/environment'; // ✅ SIN .prod

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  // ✅ Usa la URL del entorno (cambia automáticamente según build)
  private apiUrl = `${environment.apiUrl}/auth`;
  private twoFactorApiUrl = `${environment.apiUrl}/2fa`; // ✅ Agregado para TOTP

  constructor(
    private http: HttpClient,
    private router: Router
  ) {
    console.log('🌐 AuthService usando:', environment.apiUrl);
  }

  register(nombre: string, correo: string, contrasena: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/register`, { nombre, correo, contrasena });
  }

  login(correo: string, contrasena: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/login`, { correo, contrasena }).pipe(
      tap((response: any) => {
        if (response.token) {
          this.saveToken(response.token);
          this.saveUserData(response.usuario);
        }
      })
    );
  }

  loginWith2FA(correo: string, codigo2fa: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/login-2fa`, { correo, codigo2fa }).pipe(
      tap((response: any) => {
        if (response.token) {
          this.saveToken(response.token);
          this.saveUserData(response.usuario);
        }
      })
    );
  }

  // ✅ Métodos de TOTP
  setupTOTP(correo: string): Observable<any> {
    console.log('🔐 Configurando TOTP para:', correo);
    console.log('🔗 URL:', `${this.twoFactorApiUrl}/setup-totp`);
    return this.http.post(`${this.twoFactorApiUrl}/setup-totp`, { correo });
  }

  verifyTOTP(correo: string, token: string): Observable<any> {
    return this.http.post(`${this.twoFactorApiUrl}/verify-totp`, { correo, token });
  }

  validateTOTP(correo: string, token: string): Observable<any> {
    return this.http.post(`${this.twoFactorApiUrl}/validate-totp`, { correo, token });
  }

  saveToken(token: string): void {
    localStorage.setItem('token', token);
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  saveUserData(usuario: any): void {
    localStorage.setItem('user', JSON.stringify(usuario));
  }

  getUserData(): any {
    const userData = localStorage.getItem('user');
    return userData ? JSON.parse(userData) : null;
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('temp_correo_2fa');
    this.router.navigate(['/login']);
  }
}