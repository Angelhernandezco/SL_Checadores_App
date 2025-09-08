import { Component, model, signal, ViewChild, ElementRef, ChangeDetectorRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, IonInput } from '@ionic/angular';
import { ChecadorService, Usuario } from './checador.service';
import { LoaderComponent } from "src/app/shared/loader/loader.component";
import { AlertController } from '@ionic/angular';

@Component({
  selector: 'app-checador',
  standalone: true,
  templateUrl: './checador.page.html',
  styleUrls: ['./checador.page.scss'],
  imports: [CommonModule, FormsModule, IonicModule, LoaderComponent],
})
export class ChecadorPage {
  // Referencia al input usando ViewChild con IonInput
  @ViewChild('codigoInput', { static: false, read: IonInput }) codigoInput!: IonInput;

  // Signals para estado reactivo
  modo = signal<'entrada' | 'salida'>('entrada');
  codigoLeido = model('');
  usuario = signal<Usuario | null>(null);
  checadorService = inject(ChecadorService);
  alertCtrl = inject(AlertController);

  ngOnInit() {
    this.checadorService.cargarPermisos();
  }

  ngAfterViewInit() {
    setTimeout(() => {
        this.enfocarInput();
    }, 100); 
  }

  onModoChange(event: any) {
    const nuevoModo = event.detail.value as 'entrada' | 'salida';
    this.cambiarModo(nuevoModo);
  }
  
  cambiarModo(m: 'entrada' | 'salida') {
    this.modo.set(m);
    this.usuario.set(null);
    this.codigoLeido.set('');
    this.enfocarInput();
  }

  onCodigoInput(ev: any) {
    const codigo = ev.target.value;
    this.codigoLeido.set(codigo);

    const permiso = this.checadorService.permisos().find(
      p => String(p.Employee_Id) === codigo
    );

    if (permiso) {
      this.usuario.set({
        id: String(permiso.Employee_Id),
        nombre: permiso.Name,
        foto: permiso.Photo,
      });
    } else {
      this.usuario.set(null);
    }

  }

  confirmar() {
    const user = this.usuario();
    if (!user) return;

    if (this.modo() === 'entrada') {
      this.checadorService.registrarEntrada(user.id).subscribe({
        next: (res) => {
          this.playSuccess();
          this.resetForm();
        },
        error: (err) => {
          this.mostrarError(err?.error?.detail || err?.message || 'Error al registrar entrada');
        }
      });
    } else {
      this.checadorService.registrarSalida(user.id).subscribe({
        next: (res) => {
          this.playSuccess();
          this.resetForm();
        },
        error: (err) => {
          this.mostrarError(err?.error?.detail || err?.message || 'Error al registrar salida');
        }
      });
    }
  }

  cancelar() {
    this.resetForm();
  }

  private resetForm() {
    this.usuario.set(null);
    this.codigoLeido.set('');
    this.enfocarInput();
  }

  private playSuccess() {
    const audio = new Audio('assets/sounds/success2.mp3');
    audio.play();
  }

  // Método para enfocar el input
  private enfocarInput() {
    if (this.codigoInput) {
      this.codigoInput.setFocus();
    }
  }

  async mostrarError(mensaje: string) {
    const alert = await this.alertCtrl.create({
      header: 'Error al registrar al usuario',
      message: mensaje,
      buttons: [
        {
          text: 'Cerrar',
          cssClass: 'btn-alert'
        }
      ]
    });
    await alert.present();
  }

  getImageSrc(base64String: string | null ): string {
    return `data:image/jpeg;base64,${base64String}`;
  }
}