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
  IonDatetime,
  IonSelect,
  IonSelectOption
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
  storefrontOutline,
  cameraOutline,
  callOutline,
  chevronDownOutline
} from 'ionicons/icons';
import { FileUploadService } from 'src/service/file-upload.service';

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
    IonSelect,
    IonSelectOption,
    CommonModule,
    FormsModule,
    MenuComponent
  ]
})

export class ProfilePage implements OnInit {
  private authService = inject(AuthService);
  private tools = inject(ToolsService);
  private fileUploadService = inject(FileUploadService);

  countries = [
    { name: 'México', code: '+52', flag: '🇲🇽' },
    { name: 'USA', code: '+1', flag: '🇺🇸' },
    { name: 'España', code: '+34', flag: '🇪🇸' },
    { name: 'Colombia', code: '+57', flag: '🇨🇴' },
    { name: 'Argentina', code: '+54', flag: '🇦🇷' },
    { name: 'Chile', code: '+56', flag: '🇨🇱' },
    { name: 'Perú', code: '+51', flag: '🇵🇪' },
    { name: 'Ecuador', code: '+593', flag: '🇪🇨' }
  ];

  // Estado y datos
  isEditing: boolean = false;
  user: any = {};
  editUser: any = {
    name: '',
    lastname: '',
    username: '',
    birthday: '',
    store_image: '',
    store: '',
    dialing_code: '',
    cellphone: ''
  };
  previewImage: string = '';
  isImageZoomed: boolean = false;

  constructor() {
    addIcons({
      personOutline,
      peopleOutline,
      atOutline,
      calendarOutline,
      keyOutline,
      storefrontOutline,
      cameraOutline,
      callOutline,
      chevronDownOutline
    });
  }

  formatPhone(event: any) {
    let val = event.target.value.replace(/\D/g, ''); // Solo números
    if (val.length > 10) val = val.substring(0, 10); // Máximo 10 dígitos

    const parts = [];
    if (val.length > 0) parts.push('(' + val.substring(0, 3));
    if (val.length > 3) parts[0] = parts[0] + ') ' + val.substring(3, 6);
    if (val.length > 6) parts[0] = parts[0] + '-' + val.substring(6, 10);

    this.editUser.cellphone = parts[0] || '';
    event.target.value = this.editUser.cellphone;
  }

  ngOnInit() {
    this.loadUserData();
  }

  loadUserData() {
    const userData = this.authService.getUser();
    if (userData) {
      this.user = userData;
      this.previewImage = userData.store_image || '';
      // Inicializar el objeto de edición con los datos actuales
      this.editUser = { ...userData };
    }
  }

  async selectImage() {
    if (!this.isEditing) return;

    const image = await this.fileUploadService.selectImage();
    if (image) {
      this.previewImage = image.webPath || image.dataUrl || '';
      // También lo asignamos a editUser.image (aunque sea la URI temporal por ahora)
      this.editUser.image = this.previewImage;
    }
  }

  private convertBlobToBase64(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onerror = reject;
      reader.onload = () => {
        resolve(reader.result as string);
      };
      reader.readAsDataURL(blob);
    });
  }

  toggleEdit() {
    this.isEditing = !this.isEditing;
    if (!this.isEditing) {
      // Si cancelamos, restauramos los datos originales
      this.editUser = { ...this.user };
      this.previewImage = this.user.store_image || '';
    }
  }

  async saveChanges() {
    try {
      // Convertir la imagen a Base64 si ha cambiado y es una URI local
      if (this.editUser.image && this.editUser.image.startsWith('http') === false && !this.editUser.image.startsWith('data:')) {
        await this.tools.presentLoading('Procesando imagen...');
        const blob = await this.fileUploadService.getBlobFromUri(this.editUser.image);
        this.editUser.image = await this.convertBlobToBase64(blob);
        await this.tools.dismissLoading();
      }

      this.authService.updateProfile(this.user.id, this.editUser).subscribe({
        next: (res) => {
          if (res.data) {
            this.user = res.data;
            this.previewImage = this.user.image || '';
            // Actualizar el objeto de edición para la próxima vez
            this.editUser = { ...this.user };
          }
          this.isEditing = false;
        },
        error: (err) => {
          console.error(err);
        }
      });
    } catch (error) {
      this.tools.dismissLoading();
      this.tools.presentToast('Error inesperado', 'danger');
    }
  }

  toggleZoom() {
    if (this.isEditing) return; // No hacer zoom si estamos editando
    this.isImageZoomed = !this.isImageZoomed;
  }
}


