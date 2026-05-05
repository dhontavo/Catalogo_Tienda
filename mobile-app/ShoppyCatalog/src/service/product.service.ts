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
        const token = localStorage.getItem('token');
        const headers = new HttpHeaders({
            'Authorization': `Bearer ${token}`
        });
        return this.http.get<any[]>(this.API, { headers });
    }

    addProduct(product: any) {
        const body = JSON.stringify(product);

        const token = localStorage.getItem('token');
        const headers = new HttpHeaders({
            'Authorization': `Bearer ${token}`
        });
        return this.http.post(this.API, body, { headers });
    }


}