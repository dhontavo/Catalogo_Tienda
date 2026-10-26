import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './login.component.html',
})
export class LoginComponent {
  private authSvc = inject(AuthService);
  private router = inject(Router);

  username = '';
  password = '';
  showPassword = false;

  loading = signal(false);
  errorMessage = signal<string | null>(null);

  togglePassword(): void {
    this.showPassword = !this.showPassword;
  }

  onSubmit(): void {
    if (!this.username.trim() || !this.password.trim()) {
      this.errorMessage.set('Por favor ingresa tu usuario y contraseña.');
      return;
    }

    this.loading.set(true);
    this.errorMessage.set(null);

    this.authSvc.login(this.username, this.password).subscribe({
      next: (res) => {
        this.loading.set(false);
        this.router.navigate(['/admin']);
      },
      error: (err) => {
        this.loading.set(false);
        const msg = err.error?.error || err.error?.message || 'Credenciales inválidas. Verifica tu usuario y contraseña.';
        this.errorMessage.set(msg);
      },
    });
  }
}
