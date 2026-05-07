import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { ToolsService } from 'src/app/tools/tools';
import { finalize, map } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class ProductService {

    private http = inject(HttpClient);
    private tools = inject(ToolsService);
    private API = `${environment.apiUrl}products`;

    getProducts() {
        const token = localStorage.getItem('token');
        const user = localStorage.getItem('user');
        const id_store = JSON.parse(user ?? '{}').id_store;

        const headers = new HttpHeaders({
            'Authorization': `Bearer ${token}`
        });

        this.tools.presentLoading();
        return this.http.get<any>(this.API + `?id_store=${id_store}`, { headers }).pipe(
            map(res => {
                if (res && res.success) {
                    return res.data;
                }
                return [];
            }),
            finalize(() => {
                this.tools.dismissLoading();
            })
        );
    }

    getProductById(id: string) {
        const token = localStorage.getItem('token');
        const headers = new HttpHeaders({
            'Authorization': `Bearer ${token}`
        });
        return this.http.get<any>(this.API + `?id=${id}`, { headers });
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