import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface RegistroRequest {
  id: string;
  tipo: 'entrada' | 'salida';
}

export interface Usuario {
  id: string;
  nombre: string;
  foto: string;
}

@Injectable({
  providedIn: 'root'
})
export class ChecadorService {
  private apiUrl = 'https://tu-api.com/checador';

  http = inject(HttpClient);

  registrar(data: RegistroRequest): Observable<any> {
    return this.http.post(`${this.apiUrl}/registrar`, data);
  }

  obtenerUsuario(id: string): Observable<Usuario> {
    return this.http.get<Usuario>(`${this.apiUrl}/usuario/${id}`);
  }
}
