import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private http = inject(HttpClient);
  private API = environment.apiUrl;

  login(credentials: any) {
    const body = JSON.stringify(credentials);
    return this.http.post<any>(`${this.API}login`, body).pipe(
      tap(res => {
        if (res.data && res.data.token) {
          localStorage.setItem('token', res.data.token);
          localStorage.setItem('user', JSON.stringify(res.data.user));
        }
      })
    );
  }

  register(userData: any) {
    const body = JSON.stringify(userData);
    return this.http.post(`${this.API}register`, body);
  }

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }

  getToken() {
    return localStorage.getItem('token');
  }

  getUser() {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }
}
