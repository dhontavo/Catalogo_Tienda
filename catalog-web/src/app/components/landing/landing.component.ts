import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { CatalogService, Plan, Store } from '../../services/catalog.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './landing.component.html',
  styleUrls: ['./landing.component.scss'],
})
export class LandingComponent implements OnInit {
  private catalogSvc = inject(CatalogService);
  readonly authSvc = inject(AuthService);
  private router = inject(Router);

  plans = signal<Plan[]>([
    {
      id: 1,
      plan: 'Gratuito',
      advertisement: 'SI',
      max_product: 10,
      add_user: 'NO',
      max_adduser: 1,
      price: 0,
    },
    {
      id: 2,
      plan: 'Pro Emprendedor',
      advertisement: 'NO',
      max_product: 50,
      add_user: 'SI',
      max_adduser: 3,
      price: 9.99,
    },
    {
      id: 3,
      plan: 'Empresarial Ilimitado',
      advertisement: 'NO',
      max_product: null,
      add_user: 'SI',
      max_adduser: 10,
      price: 24.99,
    },
  ]);

  featuredStores = signal<Store[]>([]);
  loadingStores = signal(true);
  currentYear = new Date().getFullYear();

  ngOnInit(): void {
    // Cargar planes dinámicos de la API
    this.catalogSvc.getPlans().subscribe({
      next: (res) => {
        if (res?.data && res.data.length > 0) {
          this.plans.set(res.data);
        }
      },
      error: () => {
        // Mantener planes por defecto si falla la llamada
      },
    });

    // Cargar tiendas para el showcase
    this.catalogSvc.getStores().subscribe({
      next: (res) => {
        if (res?.data) {
          this.featuredStores.set(res.data.slice(0, 6));
        }
        this.loadingStores.set(false);
      },
      error: () => {
        this.loadingStores.set(false);
      },
    });
  }

  selectPlan(planId: number): void {
    this.router.navigate(['/register'], { queryParams: { plan: planId } });
  }

  getStoreColor(store: Store): string {
    if (store.colors) {
      const colors = store.colors.split(',').map((c) => c.trim());
      if (colors.length > 0 && colors[0]) return colors[0];
    }
    return '#2596be';
  }

  getStoreImage(store: Store): string {
    if (store.image && store.image.trim()) {
      return store.image;
    }
    return 'favicon.png';
  }

  onImgError(event: Event): void {
    const el = event.target as HTMLImageElement;
    el.src = 'favicon.png';
  }
}
