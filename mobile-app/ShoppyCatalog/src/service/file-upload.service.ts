import { Injectable, inject } from '@angular/core';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { FilePicker } from '@capawesome/capacitor-file-picker';
import { Filesystem } from '@capacitor/filesystem';
import { Platform } from '@ionic/angular';

import { ActionSheetController } from '@ionic/angular/standalone';
import { cameraOutline, imageOutline, closeOutline } from 'ionicons/icons';
import { addIcons } from 'ionicons';

@Injectable({
  providedIn: 'root'
})
export class FileUploadService {
  private platform = inject(Platform);
  private actionSheetCtrl = inject(ActionSheetController);

  constructor() {
    addIcons({ cameraOutline, imageOutline, closeOutline });
  }

  /**
   * Captura una foto o selecciona una imagen de la galería.
   * Compatible con Web, Android e iOS.
   */
  async selectImage() {
    let selectedImage: any = null;

    const actionSheet = await this.actionSheetCtrl.create({
      header: 'Seleccionar Imagen',
      buttons: [
        {
          text: 'Tomar Foto',
          icon: 'camera-outline',
          handler: async () => {
            selectedImage = await this.takePhoto(CameraSource.Camera);
          }
        },
        {
          text: 'Desde Galería',
          icon: 'image-outline',
          handler: async () => {
            selectedImage = await this.takePhoto(CameraSource.Photos);
          }
        },
        {
          text: 'Cancelar',
          icon: 'close-outline',
          role: 'cancel'
        }
      ]
    });

    await actionSheet.present();
    await actionSheet.onDidDismiss();

    return selectedImage;
  }

  private async takePhoto(source: CameraSource) {
    try {
      const image = await Camera.getPhoto({
        quality: 90,
        allowEditing: false,
        resultType: CameraResultType.Uri,
        source: source
      });
      return image;
    } catch (error) {
      console.error('Error seleccionando imagen:', error);
      return null;
    }
  }

  /**
   * Selecciona cualquier tipo de archivo.
   * Compatible con Web, Android e iOS.
   */
  async selectFile(multiple: boolean = false, type: string[] = []) {
    try {
      const result = await FilePicker.pickFiles({
        types: type,
        // multiple: multiple,
        readData: true // Esto nos da los datos en base64
      });

      return result.files;
    } catch (error) {
      console.error('Error seleccionando archivo:', error);
      return [];
    }
  }

  /**
   * Convierte un URI de Capacitor (especialmente de Camera) a un Blob
   * listo para ser enviado via FormData.
   */
  async getBlobFromUri(uri: string): Promise<Blob> {
    const response = await fetch(uri);
    return await response.blob();
  }

  /**
   * Método de ejemplo para subir un archivo al servidor.
   * @param blob El archivo en formato Blob
   * @param fileName Nombre del archivo
   * @param uploadUrl URL del endpoint de subida
   */
  async uploadFile(blob: Blob, fileName: string, uploadUrl: string) {
    const formData = new FormData();
    formData.append('file', blob, fileName);

    // Aquí usarías el HttpClient de Angular para hacer el POST
    // return this.http.post(uploadUrl, formData);

    console.log('Preparado para subir:', fileName, 'a', uploadUrl);
    return formData;
  }
}
