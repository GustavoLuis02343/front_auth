import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class TwoFactorService {
  private apiUrl = 'http://localhost:4000/api/2fa';

  constructor(private http: HttpClient) { }

  setupTOTP(correo: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/setup-totp`, { correo });
  }

  verifyTOTP(correo: string, token: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/verify-totp`, { correo, token });
  }

  validateTOTP(correo: string, token: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/validate-totp`, { correo, token });
  }
}