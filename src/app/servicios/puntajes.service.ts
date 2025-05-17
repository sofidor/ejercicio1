import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { addDoc, collection, collectionData, Firestore, limit, orderBy, query } from '@angular/fire/firestore';
import { Observable } from 'rxjs';

export interface Puntajes {
  email: string;
  fecha: string;
  puntos: number;
}

@Injectable({
  providedIn: 'root'
})
export class PuntajesService {

  constructor(private firestore: Firestore) { }

  obtenerDatosPuntajes(coleccionABuscar:string): Observable<Puntajes[]> 
  {
    const puntajes = collection(this.firestore, coleccionABuscar);

    const top5 = query(puntajes, orderBy('puntos', 'desc'), limit(5));

    return collectionData(top5, { idField: 'id' }) as Observable<Puntajes[]>;
  }

}
