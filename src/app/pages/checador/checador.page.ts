import { Component, model, signal, ViewChild, ElementRef, ChangeDetectorRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, IonInput } from '@ionic/angular';
import { Usuario } from './checador.service';

@Component({
  selector: 'app-checador',
  standalone: true,
  templateUrl: './checador.page.html',
  styleUrls: ['./checador.page.scss'],
  imports: [CommonModule, FormsModule, IonicModule],
})
export class ChecadorPage {
  // Referencia al input usando ViewChild con IonInput
  @ViewChild('codigoInput', { static: false, read: IonInput }) codigoInput!: IonInput;

  // Signals para estado reactivo
  modo = signal<'entrada' | 'salida'>('entrada');
  codigoLeido = model('');
  usuario = signal<Usuario | null>(null);

  ngAfterViewInit() {
    setTimeout(() => {
        this.enfocarInput();
    }, 100); 
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

    if (codigo && codigo.length >= 5) {
      // Simulación de búsqueda de usuario
      this.usuario.set({
        id: codigo,
        nombre: 'Juan Pérez',
        foto: 'assets/favicon.png',
      });
    } else {
      this.usuario.set(null);
    }
  }

  confirmar() {
    const user = this.usuario();
    if (!user) return;

    console.log(`✅ Registrando ${this.modo()} de:`, user);

    // TODO: llamar al servicio API
    // this.checadorService.registrar(user.id, this.modo()).subscribe(...)

      const audio = new Audio('assets/sounds/success2.mp3');
    audio.play();
    this.usuario.set(null);
    this.codigoLeido.set('');
    this.enfocarInput();
  }

  cancelar() {
    this.usuario.set(null);
    this.codigoLeido.set('');
    this.enfocarInput();
  }

  // Método para enfocar el input
  private enfocarInput() {
    if (this.codigoInput) {
      this.codigoInput.setFocus();
    }
  }
}