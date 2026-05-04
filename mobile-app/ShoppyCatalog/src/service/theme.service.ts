import { Injectable, Renderer2, RendererFactory2 } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private renderer: Renderer2;
  private isDarkMode: boolean = false;

  constructor(rendererFactory: RendererFactory2) {
    this.renderer = rendererFactory.createRenderer(null, null);
  }

  initializeTheme() {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)');
    const savedTheme = localStorage.getItem('theme');

    if (savedTheme) {
      this.isDarkMode = savedTheme === 'dark';
    } else {
      this.isDarkMode = prefersDark.matches;
    }

    this.applyTheme();

    // Listen for system changes if no manual preference is set
    prefersDark.addEventListener('change', (e) => {
      if (!localStorage.getItem('theme')) {
        this.isDarkMode = e.matches;
        this.applyTheme();
      }
    });
  }

  toggleTheme(checked: boolean) {
    this.isDarkMode = checked;
    localStorage.setItem('theme', this.isDarkMode ? 'dark' : 'light');
    this.applyTheme();
  }

  getDarkMode() {
    return this.isDarkMode;
  }

  private applyTheme() {
    if (this.isDarkMode) {
      this.renderer.addClass(document.body, 'dark');
      this.renderer.addClass(document.documentElement, 'ion-palette-dark');
      this.renderer.removeClass(document.documentElement, 'light');
    } else {
      this.renderer.removeClass(document.body, 'dark');
      this.renderer.removeClass(document.documentElement, 'ion-palette-dark');
      this.renderer.addClass(document.documentElement, 'light');
    }
  }

}
