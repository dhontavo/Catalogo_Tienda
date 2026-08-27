import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
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
  name: string;
  description?: string;
  price: number;
  image?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  error?: string;
}

@Injectable({ providedIn: 'root' })
export class CatalogService {
  private readonly base = environment.API_BASE;
  private readonly headers: HttpHeaders;

  constructor(private http: HttpClient) {
    this.headers = new HttpHeaders({ 'X-API-Key': environment.API_KEY });
  }

  getStores(): Observable<ApiResponse<Store[]>> {
    return this.http.get<ApiResponse<Store[]>>(
      `${this.base}/stores`,
      { headers: this.headers }
    );
  }

  getStore(idStore: string): Observable<ApiResponse<Store>> {
    return this.http.get<ApiResponse<Store>>(
      `${this.base}/store?id_store=${idStore}`,
      { headers: this.headers }
    );
  }

  getProducts(idStore: string): Observable<ApiResponse<Product[]>> {
    return this.http.get<ApiResponse<Product[]>>(
      `${this.base}/products?id_store=${idStore}&limit=100`,
      { headers: this.headers }
    );
  }

  getConfig(): Observable<ApiResponse<any[]>> {
    return this.http.get<ApiResponse<any[]>>(
      `${this.base}/config`,
      { headers: this.headers }
    );
  }

  placeOrder(idStore: string, products: any[]): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(
      `${this.base}/orders`,
      { id_store: idStore, products },
      { headers: this.headers.set('Content-Type', 'application/json') }
    );
  }
}
