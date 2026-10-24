import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { AuthService, RegisterPayload } from '../../services/auth.service';
import { CatalogService, Plan } from '../../services/catalog.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './register.component.html',
})
export class RegisterComponent implements OnInit {
  private authSvc = inject(AuthService);
  private catalogSvc = inject(CatalogService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  step = signal<1 | 2 | 3>(1);

  // Paso 1: Usuario
  name = '';
  lastname = '';
  birthday = '1995-01-01';
  email = '';
  username = '';
  password = '';

  // Paso 2: Tienda
  storeName = '';
  dialingCode = '+57';
  cellphone = '';
  logoBase64 = '';
  selectedColor = '#6366f1';

  // Paso 3: Plan
  selectedPlanId = signal<number>(1);
  plans = signal<Plan[]>([
    { id: 1, plan: 'Gratuito', max_product: 10, advertisement: 'SI', price: 0 },
    { id: 2, plan: 'Pro Emprendedor', max_product: 50, advertisement: 'NO', price: 9.99 },
    { id: 3, plan: 'Empresarial Ilimitado', max_product: null, advertisement: 'NO', price: 24.99 },
  ]);

  loading = signal(false);
  errorMessage = signal<string | null>(null);

  colorOptions = [
    '#6366f1', // Indigo
    '#8b5cf6', // Violet
    '#ec4899', // Pink
    '#f43f5e', // Rose
    '#ef4444', // Red
    '#f97316', // Orange
    '#10b981', // Emerald
    '#06b6d4', // Cyan
    '#0284c7', // Sky
    '#1e293b', // Slate Dark
  ];

  ngOnInit(): void {
    // Si viene ?plan=X por queryParam, preseleccionarlo
    this.route.queryParams.subscribe((params) => {
      if (params['plan']) {
        const p = parseInt(params['plan'], 10);
        if (!isNaN(p)) {
          this.selectedPlanId.set(p);
        }
      }
    });

    // Cargar planes de la base de datos
    this.catalogSvc.getPlans().subscribe({
      next: (res) => {
        if (res?.data && res.data.length > 0) {
          this.plans.set(res.data);
        }
      },
    });
  }

  goToStep(s: 1 | 2 | 3): void {
    this.errorMessage.set(null);

    if (s === 2) {
      if (!this.name.trim() || !this.lastname.trim() || !this.email.trim() || !this.username.trim() || !this.password.trim()) {
        this.errorMessage.set('Por favor completa todos los campos del propietario.');
        return;
      }
      if (this.password.length < 8) {
        this.errorMessage.set('La contraseña debe tener al menos 8 caracteres (mayúscula, minúscula, número y símbolo).');
        return;
      }
    }

    if (s === 3) {
      if (!this.storeName.trim() || !this.cellphone.trim()) {
        this.errorMessage.set('Por favor ingresa el nombre de tu tienda y el número de WhatsApp.');
        return;
      }
    }

    this.step.set(s);
  }

  onLogoChange(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        this.errorMessage.set('La imagen del logo no debe superar los 2MB.');
        return;
      }
      const reader = new FileReader();
      reader.onload = () => {
        this.logoBase64 = reader.result as string;
      };
      reader.readAsDataURL(file);
    }
  }

  selectPlan(id: number): void {
    this.selectedPlanId.set(id);
  }

  submitRegistration(): void {
    this.errorMessage.set(null);
    this.loading.set(true);

    const payload: RegisterPayload = {
      name: this.name.trim(),
      lastname: this.lastname.trim(),
      birthday: this.birthday,
      email: this.email.trim(),
      username: this.username.trim(),
      password: this.password,
      id_plan: this.selectedPlanId(),
      store: this.storeName.trim(),
      dialing_code: this.dialingCode,
      cellphone: this.cellphone.trim(),
      image: this.logoBase64 || undefined,
    };

    this.authSvc.register(payload).subscribe({
      next: () => {
        // Registro exitoso -> Iniciar sesión automáticamente
        this.authSvc.login(this.username, this.password).subscribe({
          next: () => {
            this.loading.set(false);
            this.router.navigate(['/admin']);
          },
          error: () => {
            this.loading.set(false);
            this.router.navigate(['/login']);
          },
        });
      },
      error: (err) => {
        this.loading.set(false);
        const msg = err.error?.error || err.error?.message || 'Error al crear la tienda. Verifica los datos e inténtalo de nuevo.';
        this.errorMessage.set(msg);
      },
    });
  }
}
