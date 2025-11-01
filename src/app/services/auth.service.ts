import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Router } from '@angular/router';
import { environment } from '../../environments/environment.prod'; // ✅ IMPORTA EL ENVIRONMENT

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  // ✅ Usa la URL del entorno (local o producción)
  private apiUrl = `${environment.apiUrl}/auth`;
  private emailApiUrl = `${environment.apiUrl}/email`;

  constructor(
    private http: HttpClient,
    private router: Router
  ) {}

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
    return this.http.post(`${this.apiUrl}/login-2fa`, { correo, codigo: codigo2fa }).pipe(
      tap((response: any) => {
        if (response.token) {
          this.saveToken(response.token);
          this.saveUserData(response.usuario);
        }
      })
    );
  }

  sendEmailCode(correo: string): Observable<any> {
    console.log('📧 Enviando código a:', correo);
    console.log('🔗 URL completa →', `${this.emailApiUrl}/send-email-code`);

    return this.http.post(`${this.emailApiUrl}/send-email-code`, { correo }).pipe(
      tap(response => console.log('✅ Respuesta del backend:', response)),
      tap({
        error: (error) => console.error('❌ Error al enviar correo:', error)
      })
    );
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
