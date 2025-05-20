import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';

export interface Personaje {
  quote: string; //frase
  character: string; //pj
  image: string; //imagen
  characterDirection: string; 
}

@Injectable({
  providedIn: 'root'
})
export class PreguntadosService {
  private apiUrl = 'https://thesimpsonsquoteapi.glitch.me';

  constructor(private http: HttpClient) {}

  obtenerPersonaje(): Observable<Personaje> {
    return this.http.get<Personaje[]>(`${this.apiUrl}/quotes?count=1`).pipe( 
      map(resp => resp[0])
    );
  }

  obtenerOpcionesPersonajes(): Observable<Personaje[]> {
    return this.http.get<Personaje[]>(`${this.apiUrl}/quotes?count=10`);
  }
}
