import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:4000/api/auth';
  private emailApiUrl = 'http://localhost:4000/api/email'; 

  constructor(
    private http: HttpClient,
    private router: Router
  ) { }

  register(nombre: string, correo: string, contrasena: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/register`, {
      nombre,
      correo,
      contrasena
    });
  }

  login(correo: string, contrasena: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/login`, {
      correo,
      contrasena
    }).pipe(
      tap((response: any) => {
        // Guardar datos del usuario si el login es exitoso
        if (response.token) {
          this.saveToken(response.token);
          this.saveUserData(response.usuario);
        }
      })
    );
  }

  loginWith2FA(correo: string, codigo2fa: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/login-2fa`, {
      correo,
      codigo: codigo2fa
    }).pipe(
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
    console.log('🔗 URL:', `${this.emailApiUrl}/send-email-code`); 
    
    return this.http.post(`${this.emailApiUrl}/send-email-code`, { correo }).pipe(
      //                                         
      tap(response => console.log('✅ Respuesta:', response)),
      tap({
        error: (error) => console.error('❌ Error:', error)
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
    localStorage.removeItem('temp_correo_2fa'); // ✅ LIMPIAR TAMBIÉN ESTO
    this.router.navigate(['/login']);
  }
}