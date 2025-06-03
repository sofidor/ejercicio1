import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PreguntadosService } from '../../servicios/preguntados.service';
import { Router } from '@angular/router';
import { RouterModule } from '@angular/router';
import { Personaje } from '../../interfaces/personaje';
import Swal from 'sweetalert2';
import { Firestore, collection, addDoc, getDocs, query, where, updateDoc } from '@angular/fire/firestore';
import { Auth } from '@angular/fire/auth';
import { AuthService } from '../../servicios/auth.service';

@Component({
  selector: 'app-preguntados',
  standalone: false,
  templateUrl: './preguntados.component.html',
  styleUrl: './preguntados.component.css'
})
export class PreguntadosComponent {

  personajeCorrecto!: Personaje;
  personajes!: Personaje[];
  opcionUno!: string;
  opcionDos!: string;
  opcionTres!: string;
  opcionCuatro!: string;

  score: number = 0;
  vidas: number = 3;

  userEmail: string | null = null;

  // Firebase
  firestore = inject(Firestore);
  auth = inject(Auth);

  constructor(
    private preguntadosServ: PreguntadosService,
    private router: Router,
    private authService : AuthService
  ) {}

  ngOnInit(): void {
  const user = this.authService.getCurrentUser();
  if (user) {
    this.userEmail = user.email;
  }
    this.inicializarJuego();
  }

  inicializarJuego(): void {
    this.preguntadosServ.obtenerPersonaje().subscribe(personaje => {
      this.personajeCorrecto = personaje;

      this.preguntadosServ.obtenerOpcionesPersonajes().subscribe(personajes => {
        const opcionesFiltradas = personajes.filter(p => p.character !== personaje.character);
        this.personajes = opcionesFiltradas;
        this.seleccionarOpciones();
      });
    });
  }

  seleccionarOpciones(): void {
    const opcionesSeleccionadas: Personaje[] = [];
    const indices = new Set<number>();

    while (opcionesSeleccionadas.length < 3 && this.personajes.length > 0) {
      const i = Math.floor(Math.random() * this.personajes.length);
      if (!indices.has(i)) {
        opcionesSeleccionadas.push(this.personajes[i]);
        indices.add(i);
      }
    }

    opcionesSeleccionadas.push(this.personajeCorrecto);
    opcionesSeleccionadas.sort(() => 0.5 - Math.random()); //opcion correcta en una posicion aleatorea

    this.opcionUno = opcionesSeleccionadas[0].character;
    this.opcionDos = opcionesSeleccionadas[1].character;
    this.opcionTres = opcionesSeleccionadas[2].character;
    this.opcionCuatro = opcionesSeleccionadas[3].character;
  }

  verificarRespuesta(opcion: string): void {
    if (opcion === this.personajeCorrecto.character) {
      this.score++;
      this.mostrarResultadoSwal(true);
      setTimeout(() => {
        if (this.score === 10) {
          this.ganar();
        } else {
          this.inicializarJuego();
        }
    }, 1100); 
  } else {
      this.vidas--;
      this.mostrarResultadoSwal(false);
      setTimeout(() => {
        if (this.vidas <= 0) {
          this.perder();
        } else {
          this.inicializarJuego();
        }
      }, 1100); 
  }
  }

  actualizarImagen(): string {
    return this.personajeCorrecto?.image || '';
  }

  async ganar(): Promise<void> {
    await this.guardarPuntajeSiEsMayor();
    Swal.fire({
      icon: 'success',
      title: '¡Ganaste!',
      text: `Tu puntaje fue: ${this.score}`,
      confirmButtonText: 'Jugar de nuevo',
      showCancelButton: true,
      cancelButtonText: 'Volver al Menú'
    }).then(r => r.isConfirmed ? this.reiniciarJuego() : this.volverAlHome());
  }

  async perder(): Promise<void> {
    await this.guardarPuntajeSiEsMayor();
    Swal.fire({
      icon: 'error',
      title: '¡Perdiste!',
      text: `Tu puntaje fue: ${this.score}`,
      confirmButtonText: 'Reintentar',
      showCancelButton: true,
      cancelButtonText: 'Volver al Menú'
    }).then(r => r.isConfirmed ? this.reiniciarJuego() : this.volverAlHome());
  }

reiniciarJuego(): void {
  this.score = 0;
  this.vidas = 3;
  this.inicializarJuego();
}
  volverAlHome(): void {
    this.router.navigateByUrl('/home');
  }

  async guardarPuntajeSiEsMayor(): Promise<void> {
    const usuario = this.auth.currentUser;
    if (!usuario || !usuario.email) return;

    const email = usuario.email;
    const puntos = this.score;
    const fecha = new Date().toISOString();

    const coleccionRef = collection(this.firestore, 'preguntados');
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
