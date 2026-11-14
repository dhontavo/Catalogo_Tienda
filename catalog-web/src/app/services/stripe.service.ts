import { Injectable, inject, PLATFORM_ID } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { isPlatformBrowser } from '@angular/common';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { CartItem } from './cart.service';

export interface StripeConfig {
  publishableKey: string;
  currency: string;
  isConfigured: boolean;
}

export interface StripeCheckoutResponse {
  success: boolean;
  data?: {
    id: string;
    url: string;
  };
  error?: string;
}

export interface StripeVerifyResponse {
  success: boolean;
  paid: boolean;
  type?: 'plan' | 'order' | string;
  message?: string;
  data?: any;
  orders?: any[];
  error?: string;
}

@Injectable({
  providedIn: 'root'
})
export class StripeService {
  private http = inject(HttpClient);
  private platformId = inject(PLATFORM_ID);
  private isBrowser = isPlatformBrowser(this.platformId);

  private readonly base = environment.API_BASE;
  private readonly headers = new HttpHeaders({
    'Content-Type': 'application/json',
    'X-API-Key': environment.API_KEY,
  });

  /**
   * Obtiene la configuración de Stripe (clave pública y moneda) desde el backend.
   */
  getConfig(): Observable<{ success: boolean; data: StripeConfig }> {
    return this.http.get<{ success: boolean; data: StripeConfig }>(
      `${this.base}/stripe/config`,
      { headers: this.headers }
    );
  }

  /**
   * Genera una sesión de Stripe Checkout para la suscripción / upgrade de un Plan SaaS.
   */
  createPlanCheckout(params: {
    userId: string;
    userEmail?: string;
    planId: number;
    planName: string;
    price: number;
    successUrl?: string;
    cancelUrl?: string;
  }): Observable<StripeCheckoutResponse> {
    const origin = this.isBrowser ? window.location.origin : 'http://localhost';
    const successUrl = params.successUrl || `${origin}/admin?tab=plan&session_id={CHECKOUT_SESSION_ID}&plan_upgraded=true`;
    const cancelUrl = params.cancelUrl || `${origin}/admin?tab=plan&canceled=true`;

    return this.http.post<StripeCheckoutResponse>(
      `${this.base}/stripe/create-checkout-session`,
      {
        type: 'plan',
        userId: params.userId,
        userEmail: params.userEmail,
        planId: params.planId,
        planName: params.planName,
        price: params.price,
        successUrl,
        cancelUrl,
      },
      { headers: this.headers }
    );
  }

  /**
   * Genera una sesión de Stripe Checkout para el pago de los artículos del carrito de una tienda.
   */
  createOrderCheckout(params: {
    storeId: string;
    storeName?: string;
    items: CartItem[];
    customerEmail?: string;
    successUrl?: string;
    cancelUrl?: string;
  }): Observable<StripeCheckoutResponse> {
    const origin = this.isBrowser ? window.location.origin : 'http://localhost';
    const successUrl = params.successUrl || `${origin}/store/${params.storeId}?payment_status=success&session_id={CHECKOUT_SESSION_ID}`;
    const cancelUrl = params.cancelUrl || `${origin}/store/${params.storeId}?payment_status=canceled`;

    return this.http.post<StripeCheckoutResponse>(
      `${this.base}/stripe/create-checkout-session`,
      {
        type: 'order',
        storeId: params.storeId,
        storeName: params.storeName || 'Catálogo Oficial',
        items: params.items,
        customerEmail: params.customerEmail,
        successUrl,
        cancelUrl,
      },
      { headers: this.headers }
    );
  }

  /**
   * Verifica el estado del pago tras el retorno de Stripe Checkout con session_id.
   */
  verifySession(sessionId: string): Observable<StripeVerifyResponse> {
    return this.http.get<StripeVerifyResponse>(
      `${this.base}/stripe/verify-session?session_id=${encodeURIComponent(sessionId)}`,
      { headers: this.headers }
    );
  }

  /**
   * Obtiene el historial de suscripciones del comerciante.
   */
  getSubscriptions(userId: string): Observable<{ success: boolean; data: any[] }> {
    return this.http.get<{ success: boolean; data: any[] }>(
      `${this.base}/subscriptions?id_user=${encodeURIComponent(userId)}`,
      { headers: this.headers }
    );
  }

  /**
   * Redirige al cliente a la página de pago segura alojada en Stripe.
   */
  redirectToCheckout(checkoutUrl: string): void {
    if (this.isBrowser && checkoutUrl) {
      window.location.href = checkoutUrl;
    }
  }
}

