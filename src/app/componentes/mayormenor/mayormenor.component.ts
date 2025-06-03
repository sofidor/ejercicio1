import { Component, OnInit,inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { Firestore, collection, addDoc, getDocs, query, where, updateDoc } from '@angular/fire/firestore';
import { Auth } from '@angular/fire/auth';
import { AuthService } from '../../servicios/auth.service';
import Swal from 'sweetalert2';

interface Carta {
  numero: number;
  palo: string;
  url: string;
}

@Component({
  selector: 'app-mayormenor',
  standalone: false,
  templateUrl: './mayormenor.component.html',
  styleUrl: './mayormenor.component.css'
})
export class MayormenorComponent implements OnInit {
  mazo: Carta[] = [];
  cartaActual?: Carta;
  cartaSiguiente?: Carta;
  mostrarSiguiente: boolean = false;
  respuesta?: string;
  vidasTotales: number = 3;
  puntos: number = 0;
  perdiste: boolean = false;

  userEmail: string | null = null;

  // Firebase
  firestore = inject(Firestore);
  auth = inject(Auth);

  constructor(private router: Router,private authService: AuthService) {}

  ngOnInit(): void {
  const user = this.authService.getCurrentUser();
  if (user) {
    this.userEmail = user.email;
  }
    this.iniciarMazo();
    this.iniciarNuevaRonda();
  }

  iniciarMazo(): void {
    const palos = ['basto', 'copa', 'espada', 'oro'];
    for (let i = 0; i < 12; i++) {
      for (const palo of palos) {
        const numero = i + 1;
        const url = `${palo}${numero}.png`;

        const carta: Carta = { numero, palo, url };
        this.mazo.push(carta);
      }
    }
  }

  iniciarNuevaRonda(): void {
    this.cartaActual = this.establecerCartaAleatoria();
    this.cartaSiguiente = this.establecerCartaAleatoria();
    this.mostrarSiguiente = false;
    this.respuesta = undefined;
  }

  establecerCartaAleatoria(): Carta {
    const i = Math.floor(Math.random() * this.mazo.length);
    return this.mazo[i];
  }

 Mayor(): void {
  this.mostrarSiguiente = true;
  setTimeout(() => {
    if (this.cartaActual && this.cartaSiguiente && this.cartaSiguiente.numero > this.cartaActual.numero) {
      this.respuesta = 'Correcto';
      this.puntos++;
      this.mostrarResultadoSwal(true);
    } else {
      this.respuesta = 'Incorrecto';
      this.vidasTotales--;
      this.mostrarResultadoSwal(false);
    }
    this.verificarEstado();
  }, 1500);
}


 Menor(): void {
  this.mostrarSiguiente = true;
  setTimeout(() => {
    if (this.cartaActual && this.cartaSiguiente && this.cartaSiguiente.numero < this.cartaActual.numero) {
      this.respuesta = 'Correcto';
      this.puntos++;
      this.mostrarResultadoSwal(true);
    } else {
      this.respuesta = 'Incorrecto';
      this.vidasTotales--;
      this.mostrarResultadoSwal(false);
    }
    this.verificarEstado();
  }, 1500);
}

 Igual(): void {
  this.mostrarSiguiente = true;
  setTimeout(() => {
    if (this.cartaActual && this.cartaSiguiente && this.cartaSiguiente.numero === this.cartaActual.numero) {
      this.respuesta = 'Correcto';
      this.puntos++;
      this.mostrarResultadoSwal(true);
    } else {
      this.respuesta = 'Incorrecto';
      this.vidasTotales--;
      this.mostrarResultadoSwal(false);
    }
    this.verificarEstado();
  }, 1500);
}


  async verificarEstado(): Promise<void> {
    if (this.vidasTotales === 0) {
      this.perdiste = true;
      await this.guardarPuntajeSiEsMayor();

      Swal.fire({
        icon: 'error',
        title: '¡Te quedaste sin vidas!',
        text: `Tu puntaje final fue: ${this.puntos}`,
        showCancelButton: true,
        confirmButtonText: 'Jugar de nuevo',
        cancelButtonText: 'Volver al Home',
        allowOutsideClick: false,
        reverseButtons: true
      }).then((r) => {
        if (r.isConfirmed) {
          this.reiniciarJuego();
        } else if (r.dismiss === Swal.DismissReason.cancel) {
          this.router.navigateByUrl('/home');
        }
      });
    } else {
      this.siguienteRonda();
    }
  }

  siguienteRonda(): void {
    this.cartaActual = this.cartaSiguiente;
    this.cartaSiguiente = this.establecerCartaAleatoria();
    this.mostrarSiguiente = false;
    this.respuesta = undefined;
  }

  reiniciarJuego(): void {
    this.puntos = 0;
    this.vidasTotales = 3;
    this.perdiste = false;
    this.iniciarNuevaRonda();
  }

  async guardarPuntajeSiEsMayor(): Promise<void> {
    const usuario = this.auth.currentUser;

    if (!usuario || !usuario.email) return;

    const email = usuario.email;
    const puntos = this.puntos;
    const fecha = new Date().toISOString();

    const coleccionRef = collection(this.firestore, 'mayormenor');

    const consulta = query(coleccionRef, where('email', '==', email));
    const resultado = await getDocs(consulta);

    if (!resultado.empty) {
      const docExistente = resultado.docs[0];
      const datos = docExistente.data();

      if (puntos > datos['puntos']) {
        await updateDoc(docExistente.ref, { puntos, fecha });
      }
    } else {
      await addDoc(coleccionRef, { email, puntos, fecha });
    }
  }

  mostrarResultadoSwal(correcto: boolean) {
  Swal.fire({
    icon: correcto ? 'success' : 'error',
    title: correcto ? '¡Bien hecho!' : '¡Ups!',
    text: correcto ? 'Respuesta correcta' : 'Respuesta incorrecta',
    timer: 1000,
    showConfirmButton: false,
    position: 'center',
    background: '#fff',
  });
}


  cerrarSesion() {
      this.authService.logOut().subscribe({
        next: () => {
          Swal.fire({
            icon: 'success',
            title: 'Sesión cerrada',
            timer: 1500,
            showConfirmButton: false
          }).then(() => {
            this.router.navigate(['/login']);
          });
        },
        error: (err) => {
          Swal.fire({
            icon: 'error',
            title: 'Error al cerrar sesión',
            text: err.message
          });
        }
      });
    }
}