import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { Firestore, collection, addDoc, getDocs, query, where, updateDoc } from '@angular/fire/firestore';
import { Auth } from '@angular/fire/auth';
import { AuthService } from '../../servicios/auth.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-ahorcado',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './ahorcado.component.html',
  styleUrl: './ahorcado.component.css'
})
export class AhorcadoComponent implements OnInit {
  palabras: string[] = [
    'ANGULAR', 'PROGRAMACION', 'ELEFANTE', 'DESARROLLO', 'HELADO', 'MIEDO', 'DEDOS',
    'CELULAR', 'BICICLETA', 'NUMEROS', 'CARAMELOS', 'DULCE',
    'COMPUTADORA', 'AUTOMOVIL', 'MUSICA', 'LENGUAJE', 'TELEVISOR', 'AVION',
    'PERRO', 'GATO', 'VENTANA', 'LIBRO', 'ESCALERA', 'FUTBOL',
    'PLANTA', 'CAMISA', 'CAFE', 'SILLA', 'MOCHILA'
  ];
  palabra: string = '';
  alfabeto: string[] = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
  letrasIntentadas: string[] = [];
  vidasTotales: number = 6;
  erroresDePalabra: number = 0;
  palabraMostrada: string[] = [];
  puntos: number = 0;
  perdiste: boolean = false;
  userEmail: string | null = null;

  // Firebase
  firestore = inject(Firestore);
  auth = inject(Auth);

  constructor(
    private router: Router,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.authService.getUserEmailObservable().subscribe(mail => {
      this.userEmail = mail;
    });
    this.inicializarNuevaPalabra();
  }

  inicializarNuevaPalabra(): void {
    this.seleccionarPalabraAleatoria();
    this.palabraMostrada = Array(this.palabra.length).fill('_');
    this.letrasIntentadas = [];
    this.erroresDePalabra = 0;
  }

  seleccionarPalabraAleatoria(): void {
    const indice = Math.floor(Math.random() * this.palabras.length);
    this.palabra = this.palabras[indice];
  }

  async intentarLetra(letra: string): Promise<void> {
    if (this.perdiste || this.letrasIntentadas.includes(letra)) return;

    this.letrasIntentadas.push(letra);

    if (this.palabra.includes(letra)) {
      this.actualizarPalabraMostrada(letra);

    if (!this.palabraMostrada.includes('_')) {
      this.puntos++;
      Swal.fire({
        icon: 'success',
        title: '¡Bien hecho!',
        text: 'Respuesta correcta',
        timer: 1000,
        showConfirmButton: false,
        position: 'center',
        background: '#fff',
      }).then(() => {
        this.inicializarNuevaPalabra();
      });
    }
    } else {
      this.vidasTotales--;
      this.erroresDePalabra++;

      if (this.vidasTotales === 0) {
        this.perdiste = true;
        await this.guardarPuntajeSiEsMayor(); // Esperar que se guarde antes del swal
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
      }
    }
  }

  actualizarPalabraMostrada(letra: string): void {
    for (let i = 0; i < this.palabra.length; i++) {
      if (this.palabra[i] === letra) {
        this.palabraMostrada[i] = letra;
      }
    }
  }

  reiniciarJuego(): void {
    this.puntos = 0;
    this.vidasTotales = 6;
    this.perdiste = false;
    this.inicializarNuevaPalabra();
  }

  async guardarPuntajeSiEsMayor(): Promise<void> {
    const usuario = this.auth.currentUser;
    if (!usuario || !usuario.email) return;

    const email = usuario.email;
    const puntos = this.puntos;
    const fecha = new Date().toISOString();

    const coleccionRef = collection(this.firestore, 'ahorcado');
    const consulta = query(coleccionRef, where('email', '==', email));
    const resultado = await getDocs(consulta);

    if (!resultado.empty) {
      const docExistente = resultado.docs[0];
      const datos = docExistente.data();
      const puntajeAnterior = datos['puntos'] ?? 0;

      if (puntos > puntajeAnterior) {
        await updateDoc(docExistente.ref, { puntos, fecha });
        console.log('🏆 Nuevo puntaje guardado (mejor que el anterior)');
      } else {
        console.log('⚠️ Puntaje no superado. No se actualiza.');
      }
    } else {
      await addDoc(coleccionRef, { email, puntos, fecha });
      console.log('🆕 Primer puntaje guardado');
    }
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
