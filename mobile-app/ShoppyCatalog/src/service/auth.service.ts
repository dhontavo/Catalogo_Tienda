import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { tap, finalize } from 'rxjs/operators';
import { ToolsService } from 'src/app/tools/tools';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private http = inject(HttpClient);
  private tools = inject(ToolsService);
  private API = environment.apiUrl;

  login(credentials: any) {
    this.tools.presentLoading();
    const body = JSON.stringify(credentials);
    return this.http.post<any>(`${this.API}login`, body).pipe(
      tap(res => {
        if (res.data && res.data.token) {
          localStorage.setItem('token', res.data.token);
          localStorage.setItem('user', JSON.stringify(res.data.user));
        }
      }),
      finalize(() => {
        this.tools.dismissLoading();
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

  updateProfile(id: string, user: any) {
    const body = JSON.stringify(user);
    this.tools.presentLoading();
    return this.http.put<any>(`${this.API}users/${id}`, body).pipe(
      tap(res => {
        if (res.data) {
          localStorage.setItem('user', JSON.stringify(res.data));
        }
        this.tools.presentToast('Perfil actualizado correctamente', 'success');
        this.tools.dismissLoading();

      }),
      finalize(() => {
        this.tools.dismissLoading();
      })
    );
  }

}