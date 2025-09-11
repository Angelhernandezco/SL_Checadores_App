import { Component, signal, inject, OnInit, AfterViewInit, ViewChild, ElementRef, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ChecadorService, Usuario } from './checador.service';
import { LoaderComponent } from "src/app/shared/loader/loader.component";
import { IonHeader, IonToolbar, IonTitle, IonContent, IonInput, IonSpinner, AlertController  } from "@ionic/angular/standalone";

@Component({
  selector: 'app-checador',
  standalone: true,
  templateUrl: './checador.page.html',
  styleUrls: ['./checador.page.scss'],
  imports: [
    IonSpinner, IonContent, IonTitle, IonToolbar, IonHeader,
    CommonModule, FormsModule, LoaderComponent, IonInput 
  ],
})
export class ChecadorPage implements OnInit, AfterViewInit {
  modo = signal<'entrada' | 'salida'>('salida');
  codigoLeido = signal<string>('');
  usuario = signal<Usuario | null>(null);
  checadorService = inject(ChecadorService);
  alertCtrl = inject(AlertController);
  isLoadingPermiso = signal(false);
  mensajeError = signal<string | null>(null);
  private ngZone = inject(NgZone);

  @ViewChild('hiddenInput', { static: true }) hiddenInput!: ElementRef<HTMLInputElement>;
  private buffer: string = '';

  ngOnInit() {
    // Listener para teclas del scanner Zebra (modo teclado)
    this.hiddenInput.nativeElement.addEventListener('input', (ev: any) => {
      const valor: string = ev.target.value;
      if (!valor) return;

      // Agrega al buffer
      this.buffer += valor;

      // Cuando aparece "-", procesamos
      if (this.buffer.includes('-')) {
        const codigo = this.buffer.replace(/-/g, '').trim();
        this.buffer = '';
        this.codigoLeido.set(codigo);
        this.procesarCodigo(codigo);
        this.hiddenInput.nativeElement.value = '';
      }
    });
  }

  ngAfterViewInit() {
    this.focusInputContinuo();
  }

  private focusInputContinuo() {
    const focus = () => {
      if (this.hiddenInput) {
        this.hiddenInput.nativeElement.focus();
      }
      requestAnimationFrame(focus);
    };
    focus();
  }

  cambiarModo(m: 'entrada' | 'salida') {
    this.modo.set(m);
    this.usuario.set(null);
    this.codigoLeido.set('');
  }

  private procesarCodigo(codigo: string) {
    if (!codigo) {
      this.usuario.set(null);
      this.mensajeError.set(null);
      return;
    }

    this.isLoadingPermiso.set(true);
    this.mensajeError.set(null);

    this.checadorService.verificarPermiso(codigo).subscribe({
      next: (permiso) => {
        this.usuario.set({
          id: String(permiso.Employee_Id),
          nombre: permiso.Name,
          foto: permiso.Photo,
        });
        this.isLoadingPermiso.set(false);
      },
      error: (err) => {
        const mensaje = err?.error?.detail || err?.message || 'Error al verificar permiso';
        this.mensajeError.set(mensaje);
        this.usuario.set(null);
        this.isLoadingPermiso.set(false);
      }
    });
  }

  confirmar() {
    const user = this.usuario();
    if (!user) return;

    const accion = this.modo() === 'entrada'
      ? this.checadorService.registrarEntrada(user.id)
      : this.checadorService.registrarSalida(user.id);

    accion.subscribe({
      next: () => {
        this.playSuccess();
        this.resetForm();
      },
      error: (err) => {
        const mensaje = err?.error?.detail || err?.message || 'Error al registrar usuario';
        this.mostrarError(mensaje);
      }
    });
  }

  cancelar() {
    this.resetForm();
  }

  private resetForm() {
    this.usuario.set(null);
    this.codigoLeido.set('');
    this.mensajeError.set('');
    this.buffer = '';
  }

  private playSuccess() {
    const audio = new Audio('assets/sounds/success2.mp3');
    audio.play();
  }

  async mostrarError(mensaje: string) {
    const alert = await this.alertCtrl.create({
      header: 'Error al registrar al usuario',
      message: mensaje,
      buttons: [{ text: 'Cerrar', role: 'cancel' }]
    });
    await alert.present();
  }

  getImageSrc(base64String: string | null): string {
    return `data:image/jpeg;base64,${base64String}`;
  }
}
