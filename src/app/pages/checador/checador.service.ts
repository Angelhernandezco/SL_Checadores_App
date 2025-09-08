import { inject, Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { finalize, Observable } from 'rxjs';
import { environment } from 'src/environments/environment.prod';

export interface Usuario {
  id: string;
  nombre: string;
  foto: string | null;
}

export interface Permiso {
  Employee_Id: number;
  Name: string;
  Photo: string | null;
  Company: string;
  Valid_Until: string;
}

@Injectable({
  providedIn: 'root'
})
export class ChecadorService {
  private apiUrl = `${environment.apiUrl}`;

  http = inject(HttpClient);

  permisos = signal<Permiso[]>([]);
  isLoading = signal<boolean>(false);

  registrarEntrada(id: string): Observable<Usuario> {
    this.isLoading.set(true);
    return this.http.post<Usuario>(`${this.apiUrl}/exit_record/in/${id}`, {}).pipe(
      finalize(() => this.isLoading.set(false)) 
    );
  }

  registrarSalida(id: string): Observable<Usuario> {
    this.isLoading.set(true);
    return this.http.post<Usuario>(`${this.apiUrl}/exit_record/out/${id}`, {}).pipe(
      finalize(() => this.isLoading.set(false)) 
    );
  }

  cargarPermisos(): void {
    this.isLoading.set(true);
    this.http.get<Permiso[]>(`${this.apiUrl}/permissions/`).subscribe({
      next: (data) => {
        this.permisos.set(data);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('❌ Error al cargar permisos', err);
        this.permisos.set([]);
        this.isLoading.set(false);
      }
    });
  }
}
