import { Injectable, signal, computed, inject, PLATFORM_ID } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { isPlatformBrowser } from '@angular/common';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';
import { environment } from '../../environments/environment';

export interface UserSession {
  id: string;
  name: string;
  lastname: string;
  email: string;
  username: string;
  id_store: string;
  id_plan: number;
  store?: string;
  dialing_code?: string;
  cellphone?: string;
  store_image?: string;
  colors?: string;
}

export interface LoginResponse {
  message: string;
  data: {
    user: UserSession;
    token: string;
  };
}

export interface RegisterPayload {
  name: string;
  lastname: string;
  birthday: string;
  email: string;
  username: string;
  password: string;
  id_plan: number;
  store: string;
  dialing_code?: string;
  cellphone?: string;
  image?: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);
  private platformId = inject(PLATFORM_ID);
  private isBrowser = isPlatformBrowser(this.platformId);

  private readonly base = environment.API_BASE;
  private readonly headers = new HttpHeaders({
    'X-API-Key': environment.API_KEY,
    'Content-Type': 'application/json'
  });

  // ─── Signals ──────────────────────────────────────────────────────────────
  currentUser = signal<UserSession | null>(null);
  token = signal<string | null>(null);

  isAuthenticated = computed(() => !!this.currentUser() && !!this.token());
  storeId = computed(() => this.currentUser()?.id_store || '');
  storeName = computed(() => this.currentUser()?.store || 'Mi Tienda');
  userPlanId = computed(() => this.currentUser()?.id_plan ?? 1);
  storeImage = computed(() => this.currentUser()?.store_image || 'favicon.png');
  storeColors = computed(() => this.currentUser()?.colors || '#10b981');
  storeDialingCode = computed(() => this.currentUser()?.dialing_code || '+52');
  storeCellphone = computed(() => this.currentUser()?.cellphone || '');

  constructor() {
    this.restoreSession();
  }

  private restoreSession(): void {
    if (!this.isBrowser) return;

    try {
      const savedUser = localStorage.getItem('shoppy_saas_user');
      const savedToken = localStorage.getItem('shoppy_saas_token');

      if (savedUser && savedToken) {
        this.currentUser.set(JSON.parse(savedUser));
        this.token.set(savedToken);
      }
    } catch (e) {
      console.error('Error restaurando sesión:', e);
      this.clearStorage();
    }
  }

  // ─── Login ────────────────────────────────────────────────────────────────
  login(username: string, password: string): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(
      `${this.base}/login`,
      { username, password },
      { headers: this.headers }
    ).pipe(
      tap((res) => {
        if (res?.data?.user && res?.data?.token) {
          this.setSession(res.data.user, res.data.token);
        }
      })
    );
  }

  // ─── Register ─────────────────────────────────────────────────────────────
  register(payload: RegisterPayload): Observable<any> {
    return this.http.post(
      `${this.base}/register`,
      payload,
      { headers: this.headers }
    );
  }

  // ─── Actualizar Perfil / Tienda / Plan ────────────────────────────────────
  updateProfile(data: Partial<UserSession> & { image?: string; store?: string }): Observable<any> {
    const userId = this.currentUser()?.id;
    return this.http.put(
      `${this.base}/users/${userId}`,
      data,
      { headers: this.headers }
    ).pipe(
      tap((res: any) => {
        if (res?.data) {
          const current = this.currentUser();
          const updated = { ...current, ...res.data };
          this.setSession(updated, this.token() || '');
        }
      })
    );
  }

  // ─── Sesión ───────────────────────────────────────────────────────────────
  setSession(user: UserSession, token: string): void {
    this.currentUser.set(user);
    this.token.set(token);

    if (this.isBrowser) {
      localStorage.setItem('shoppy_saas_user', JSON.stringify(user));
      localStorage.setItem('shoppy_saas_token', token);
    }
  }

  logout(): void {
    this.clearStorage();
    this.currentUser.set(null);
    this.token.set(null);
    this.router.navigate(['/login']);
  }

  private clearStorage(): void {
    if (this.isBrowser) {
      localStorage.removeItem('shoppy_saas_user');
      localStorage.removeItem('shoppy_saas_token');
    }
  }
}
