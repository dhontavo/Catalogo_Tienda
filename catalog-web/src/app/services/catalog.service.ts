import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { retry } from 'rxjs/operators';
import { environment } from '../../environments/environment';

export interface Store {
  id: string;
  store: string;
  dialing_code?: string;
  cellphone?: string;
  image?: string;
  colors?: string;
}

export interface Product {
  id: number | string;
  id_product?: number | string;
  id_store?: string;
  id_user?: string;
  name: string;
  description?: string;
  price: number;
  image?: string;
  view?: number;
}

export interface Plan {
  id: number;
  plan: string;
  advertisement?: string;
  max_product?: number | null;
  add_user?: string;
  max_adduser?: number | null;
  price?: number | null;
}

export interface OrderItem {
  id: string;
  id_store: string;
  id_product: string;
  create_at: string;
  product?: {
    name: string;
    price: number;
    image?: string;
  };
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  error?: string;
  message?: string;
}

@Injectable({ providedIn: 'root' })
export class CatalogService {
  private readonly base = environment.API_BASE;
  private readonly headers: HttpHeaders;

  constructor(private http: HttpClient) {
    this.headers = new HttpHeaders({
      'X-API-Key': environment.API_KEY,
      'Content-Type': 'application/json'
    });
  }

  // ─── Tiendas ─────────────────────────────────────────────────────────────
  getStores(): Observable<ApiResponse<Store[]>> {
    return this.http.get<ApiResponse<Store[]>>(
      `${this.base}/stores`,
      { headers: this.headers }
    ).pipe(retry({ count: 2, delay: 500 }));
  }

  getStore(idStore: string): Observable<ApiResponse<Store>> {
    return this.http.get<ApiResponse<Store>>(
      `${this.base}/store?id_store=${idStore}`,
      { headers: this.headers }
    ).pipe(retry({ count: 2, delay: 500 }));
  }

  updateStore(storeData: Partial<Store> & { id_store?: string; id?: string }): Observable<ApiResponse<Store>> {
    return this.http.put<ApiResponse<Store>>(
      `${this.base}/store`,
      storeData,
      { headers: this.headers }
    );
  }

  // ─── Productos ───────────────────────────────────────────────────────────
  getProducts(idStore: string): Observable<ApiResponse<Product[]>> {
    return this.http.get<ApiResponse<Product[]>>(
      `${this.base}/products?id_store=${idStore}&limit=100`,
      { headers: this.headers }
    ).pipe(retry({ count: 2, delay: 500 }));
  }

  createProduct(product: {
    id_store: string;
    id_user: string;
    name: string;
    description: string;
    price: number;
    image: string;
  }): Observable<ApiResponse<Product>> {
    return this.http.post<ApiResponse<Product>>(
      `${this.base}/products`,
      product,
      { headers: this.headers }
    );
  }

  updateProduct(id: string | number, product: {
    name: string;
    description: string;
    price: number;
    image?: string;
  }): Observable<ApiResponse<boolean>> {
    return this.http.put<ApiResponse<boolean>>(
      `${this.base}/products?id=${id}`,
      product,
      { headers: this.headers }
    );
  }

  deleteProduct(id: string | number): Observable<ApiResponse<boolean>> {
    return this.http.delete<ApiResponse<boolean>>(
      `${this.base}/products?id=${id}`,
      { headers: this.headers }
    );
  }

  // ─── Planes SaaS ─────────────────────────────────────────────────────────
  getPlans(): Observable<ApiResponse<Plan[]>> {
    return this.http.get<ApiResponse<Plan[]>>(
      `${this.base}/plans`,
      { headers: this.headers }
    ).pipe(retry({ count: 2, delay: 500 }));
  }

  // ─── Órdenes / Pedidos ───────────────────────────────────────────────────
  placeOrder(idStore: string, products: any[]): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(
      `${this.base}/orders`,
      { id_store: idStore, products },
      { headers: this.headers }
    );
  }

  getStoreOrders(idStore: string): Observable<ApiResponse<OrderItem[]>> {
    return this.http.get<ApiResponse<OrderItem[]>>(
      `${this.base}/orders?id_store=${idStore}`,
      { headers: this.headers }
    ).pipe(retry({ count: 2, delay: 500 }));
  }

  // ─── Configuración ───────────────────────────────────────────────────────
  getConfig(): Observable<ApiResponse<any[]>> {
    return this.http.get<ApiResponse<any[]>>(
      `${this.base}/config`,
      { headers: this.headers }
    ).pipe(retry({ count: 2, delay: 500 }));
  }
}
