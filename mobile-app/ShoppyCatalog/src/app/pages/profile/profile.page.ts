import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonList,
  IonItem,
  IonLabel,
  IonIcon,
  IonButton,
  IonInput,
  IonDatetimeButton,
  IonModal,
  IonDatetime
} from '@ionic/angular/standalone';
import { MenuComponent } from 'src/app/componet/menu/menu.component';
import { AuthService } from 'src/service/auth.service';
import { ToolsService } from 'src/app/tools/tools';
import { addIcons } from 'ionicons';
import {
  personOutline,
  peopleOutline,
  atOutline,
  calendarOutline,
  keyOutline,
  storefrontOutline
} from 'ionicons/icons';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.scss'],
  standalone: true,
  imports: [
    IonList,
    IonItem,
    IonLabel,
    IonIcon,
    IonButton,
    IonInput,
    IonDatetimeButton,
    IonModal,
    IonDatetime,
    CommonModule,
    FormsModule,
    MenuComponent
  ]
})

export class ProfilePage implements OnInit {
  private authService = inject(AuthService);
  private tools = inject(ToolsService);

  // Estado y datos
  isEditing: boolean = false;
  user: any = {};
  editUser: any = {
    name: '',
    lastname: '',
    username: '',
    birthday: ''
  };

  constructor() {
    addIcons({
      personOutline,
      peopleOutline,
      atOutline,
      calendarOutline,
      keyOutline,
      storefrontOutline
    });
  }

  ngOnInit() {
    this.loadUserData();
  }

  loadUserData() {
    const userData = this.authService.getUser();
    if (userData) {
      this.user = userData;
      // Inicializar el objeto de edición con los datos actuales
      this.editUser = { ...userData };
    }
  }

  toggleEdit() {
    this.isEditing = !this.isEditing;
    if (!this.isEditing) {
      // Si cancelamos, restauramos los datos originales
      this.editUser = { ...this.user };
    }
  }

  async saveChanges() {
    const loading = await this.tools.presentLoading('Guardando cambios...');

    // Aquí iría la llamada a tu servicio para actualizar el perfil
    // Ejemplo: this.authService.updateProfile(this.editUser).subscribe(...)

    setTimeout(() => {
      this.user = { ...this.editUser };
      // Opcional: Actualizar el usuario en el storage
      localStorage.setItem('user', JSON.stringify(this.user));

      this.isEditing = false;
      loading.dismiss();
      this.tools.presentToast('Perfil actualizado con éxito', 'success');
    }, 1500);
  }
}


