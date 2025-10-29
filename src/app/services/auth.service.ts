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
      codigo2fa
    }).pipe(
      tap((response: any) => {
        if (response.token) {
          this.saveToken(response.token);
          this.saveUserData(response.usuario);
        }
      })
    );
  }

  saveToken(token: string): void {
    localStorage.setItem('token', token);
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  // ⭐ NUEVO: Guardar datos del usuario
  saveUserData(usuario: any): void {
    localStorage.setItem('user', JSON.stringify(usuario));
  }

  // ⭐ NUEVO: Obtener datos del usuario
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
    this.router.navigate(['/login']);
  }
}