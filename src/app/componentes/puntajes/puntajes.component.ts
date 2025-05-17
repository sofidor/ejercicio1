import { Component, OnInit } from '@angular/core';
import { getDocs, collection } from 'firebase/firestore';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Observable } from 'rxjs';
import { Puntajes, PuntajesService } from '../../servicios/puntajes.service';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { Auth } from '@angular/fire/auth';
import { AuthService } from '../../servicios/auth.service';

@Component({
  selector: 'app-puntajes',
  standalone: true,
  imports: [CommonModule,RouterLink],
  templateUrl: './puntajes.component.html',
  styleUrl: './puntajes.component.css'
})


export class PuntajesComponent implements OnInit {

  datosPuntajes$: Observable<Puntajes[]> | undefined;
  userEmail: string | null = null;


  constructor(private puntajeService : PuntajesService, private authService: AuthService){}

  ngOnInit(): void {
      const user = this.authService.getCurrentUser();
  if (user) { this.userEmail = user.email; }   

    this.cambiarColeccion('preguntados');
  }

  onCollectionChange(event: Event): void {
    const selectElement = event.target as HTMLSelectElement;
    const collectionName = selectElement.value; // Obtén el nombre de la colección seleccionada
    this.cambiarColeccion(collectionName);
  }

  // Función que actualiza los datos de puntajes basados en la colección seleccionada
  cambiarColeccion(coleccion: string): void {
    this.datosPuntajes$ = this.puntajeService.obtenerDatosPuntajes(coleccion);
  }

}
