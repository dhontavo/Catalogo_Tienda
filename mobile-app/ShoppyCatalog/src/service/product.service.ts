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

    /**
     * Obtiene los headers con el token de autorización
     */
    private getHeaders() {
        const token = localStorage.getItem('token');
        return new HttpHeaders({
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        });
    }

    getProducts() {
        const user = localStorage.getItem('user');
        const id_store = JSON.parse(user ?? '{}').id_store;

        this.tools.presentLoading();
        return this.http.get<any>(`${this.API}?id_store=${id_store}`, { headers: this.getHeaders() }).pipe(
            map(res => (res && res.success) ? res.data : []),
            finalize(() => this.tools.dismissLoading())
        );
    }

    getProductById(id: string) {
        this.tools.presentLoading();
        return this.http.get<any>(`${this.API}?id=${id}`, { headers: this.getHeaders() }).pipe(
            map(res => (res && res.success) ? res.data : null),
            finalize(() => this.tools.dismissLoading())
        );
    }

    addProduct(product: any) {
        const body = JSON.stringify(product);
        this.tools.presentLoading();

        return this.http.post<any>(this.API, body, { headers: this.getHeaders() }).pipe(
            map(res => {
                if (res && res.success) {
                    this.tools.presentToast('Producto agregado correctamente', 'success');
                    return res.data;
                }
                throw new Error(res.error || 'Error al agregar producto');
            }),
            finalize(() => this.tools.dismissLoading())
        );
    }

    deleteProduct(id: string) {
        this.tools.presentLoading();
        return this.http.delete<any>(`${this.API}?id=${id}`, { headers: this.getHeaders() }).pipe(
            map(res => {
                if (res && res.success) {
                    this.tools.presentToast('Producto eliminado correctamente', 'success');
                    return res.data;
                }
                throw new Error(res.error || 'Error al eliminar producto');
            }),
            finalize(() => this.tools.dismissLoading())
        );
    }

    editProduct(id: string, product: any) {
        const body = JSON.stringify(product);
        this.tools.presentLoading();

        return this.http.put<any>(`${this.API}?id=${id}`, body, { headers: this.getHeaders() }).pipe(
            map(res => {
                if (res && res.success) {
                    this.tools.presentToast('Producto editado correctamente', 'success');
                    return res.data;
                }
                throw new Error(res.error || 'Error al editar producto');
            }),
            finalize(() => this.tools.dismissLoading())
        );
    }
}