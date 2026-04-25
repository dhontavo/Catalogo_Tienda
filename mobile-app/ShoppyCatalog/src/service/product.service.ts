import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { inject } from '@angular/core';
import { environment } from 'src/environments/environment';

@Injectable({
    providedIn: 'root'
})
export class ProductService {

    private http = inject(HttpClient);
    private API = `${environment.apiUrl}products`;

    getProducts() {
        return this.http.get<any[]>(this.API);
    }

    addProduct(product: any) {
        return this.http.post(this.API, product);
    }

}