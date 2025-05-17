import { Injectable, inject } from '@angular/core';
import { Firestore, collection, addDoc, collectionData, query, orderBy } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { Mensaje } from '../interfaces/mensaje';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class ChatService {

  firestore = inject(Firestore);

  guardarChats(mensaje: Mensaje) {
    const col = collection(this.firestore, 'chats');
    return addDoc(col, mensaje);
  }

  obtenerChats(): Observable<Mensaje[]> {
    const col = collection(this.firestore, 'chats');
    const q = query(col, orderBy('timestamp', 'asc'));

    return collectionData(q, { idField: 'id' }).pipe(
      map((messages: Mensaje[]) => messages.map((msg: any) => ({
        ...msg,
        timestamp: (msg.timestamp as any).toDate()
      })))
    ) as Observable<Mensaje[]>;
  }
}

