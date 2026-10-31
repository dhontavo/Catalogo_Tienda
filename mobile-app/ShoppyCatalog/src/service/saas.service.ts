import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { Observable, map } from 'rxjs';

export interface Plan {
  id: number;
  name: string;
  price: number;
  max_product: number;
  status: number;
}

export interface Store {
  id: string;
  name: string;
  theme: string;
  color: string;
  logo: string;
  phone: string;
  id_plan?: number;
  created_at?: string;
}

export interface OrderItem {
  id: string;
  id_product: string;
  id_store: string;
  quantity: number;
  total_price: number;
  created_at: string;
  product_name?: string;
  product_price?: number;
  product_image?: string;
}

@Injectable({
  providedIn: 'root'
})
export class SaasService {
  private http = inject(HttpClient);
  private API = environment.apiUrl;

  // Obtener planes SaaS disponibles
  getPlans(): Observable<Plan[]> {
    return this.http.get<any>(`${this.API}plans`).pipe(
      map(res => (res && res.success) ? res.data : [])
    );
  }

  // Obtener tiendas activas en el SaaS
  getStores(): Observable<Store[]> {
    return this.http.get<any>(`${this.API}stores`).pipe(
      map(res => (res && res.success) ? res.data : [])
    );
  }

  // Obtener información de una tienda específica
  getStore(id_store: string): Observable<Store | null> {
    return this.http.get<any>(`${this.API}store?id_store=${id_store}`).pipe(
      map(res => (res && res.success) ? res.data : null)
    );
  }

  // Actualizar configuración/branding de la tienda
  updateStore(id_store: string, data: Partial<Store>): Observable<any> {
    return this.http.put<any>(`${this.API}store`, { id: id_store, ...data });
  }

  // Obtener productos de una tienda para el catálogo público
  getStoreProducts(id_store: string): Observable<any[]> {
    return this.http.get<any>(`${this.API}products?id_store=${id_store}`).pipe(
      map(res => (res && res.success) ? res.data : [])
    );
  }

  // Obtener pedidos recibidos por la tienda
  getStoreOrders(id_store: string): Observable<OrderItem[]> {
    return this.http.get<any>(`${this.API}orders?id_store=${id_store}`).pipe(
      map(res => (res && res.success) ? res.data : [])
    );
  }

  // Registrar un pedido hecho por el cliente en el catálogo
  createOrder(orderData: { id_product: string; id_store: string; quantity: number; total_price: number }): Observable<any> {
    return this.http.post<any>(`${this.API}orders`, orderData);
  }
}
