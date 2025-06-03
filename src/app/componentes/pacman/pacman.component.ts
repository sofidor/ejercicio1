import { CommonModule } from '@angular/common';
import { Component, inject, OnDestroy } from '@angular/core';
import { RouterLink, Router } from '@angular/router';
import Swal from 'sweetalert2';
import { Firestore, collection, addDoc, getDocs, query, where, updateDoc } from '@angular/fire/firestore';
import { Auth } from '@angular/fire/auth';
import { AuthService } from '../../servicios/auth.service';


@Component({
  selector: 'app-pacman',
  standalone: false,
  templateUrl: './pacman.component.html',
  styleUrl: './pacman.component.css'
})
export class PacmanComponent implements OnDestroy {
  board: number[][] = [];
  pacmanPosition = { x: 1, y: 1 };
  ghostPositions = [  
    { x: 9, y: 9 },
    { x: 11, y: 9 },
    { x: 13, y: 9 }
  ];
  score = 0;
  vidas: number = 3;
  puntajeGuardado: boolean = false;
  juegoTerminado: boolean = false;
  userEmail: string | null = null;
  ghostInterval: any;

  // Firebase
  firestore = inject(Firestore);
  auth = inject(Auth);

  constructor(private router: Router,  private authService: AuthService) {}

  ngOnInit() {
      this.authService.getUserEmailObservable().subscribe(mail => {
      this.userEmail = mail;
    });
    this.initializeBoard();
    this.startGhostMovement();
  }

  initializeBoard() {
    this.board = [ // 1= pared , 2= moneda
      [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
      [1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 1],
      [1, 2, 1, 1, 1, 1, 1, 1, 1, 2, 1, 1, 1, 1, 1, 1, 1, 2, 2, 1],
      [1, 2, 1, 2, 2, 2, 2, 2, 1, 2, 1, 2, 2, 2, 2, 2, 1, 2, 2, 1],
      [1, 2, 1, 2, 1, 1, 1, 2, 1, 2, 1, 2, 1, 1, 1, 2, 1, 2, 2, 1],
      [1, 2, 1, 2, 1, 2, 1, 2, 2, 2, 2, 2, 1, 2, 1, 2, 1, 2, 2, 1],
      [1, 2, 1, 2, 1, 2, 1, 2, 1, 1, 1, 2, 1, 2, 1, 2, 1, 2, 2, 1],
      [1, 2, 2, 2, 2, 2, 1, 2, 1, 2, 2, 2, 1, 2, 2, 2, 2, 2, 2, 1],
      [1, 2, 1, 1, 1, 1, 1, 2, 1, 1, 1, 2, 1, 1, 1, 1, 1, 1, 2, 1],
      [1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 1],
      [1, 1, 1, 1, 1, 1, 1, 2, 1, 1, 1, 2, 1, 1, 1, 1, 1, 1, 1, 1],
      [1, 2, 2, 2, 2, 2, 1, 2, 2, 2, 2, 2, 1, 2, 2, 2, 2, 2, 2, 1],
      [1, 2, 1, 1, 1, 2, 1, 2, 1, 1, 1, 2, 1, 2, 1, 1, 1, 2, 1, 1],
      [1, 2, 2, 2, 1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 1, 2, 2, 2, 2, 1],
      [1, 1, 1, 2, 1, 1, 1, 1, 1, 2, 1, 1, 1, 1, 1, 2, 1, 1, 1, 1],
      [1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 1],
      [1, 2, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2, 1],
      [1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 1],
      [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    ];
  }

  movePacman(dx: number, dy: number) {
    const newX = this.pacmanPosition.x + dx;
    const newY = this.pacmanPosition.y + dy;

    if (newX >= 0 && newX < this.board[0].length && newY >= 0 && newY < this.board.length && this.board[newY][newX] !== 1) {
      this.pacmanPosition = { x: newX, y: newY };

    if (this.board[newY][newX] === 2) {
      this.board[newY][newX] = 0;
      this.score += 10; // moneda normal
    } 
      this.checkCollision();
      this.verificarVictoria();
    }
  }

async checkCollision() { //si choca con un fantasma
  if (this.juegoTerminado) return;

  for (const ghost of this.ghostPositions) {
    if (ghost.x === this.pacmanPosition.x && ghost.y === this.pacmanPosition.y) {
      this.vidas--;
      if (this.vidas > 0) {
        Swal.fire({
          icon: 'warning',
          title: '¡Cuidado!',
          text: `Te pisó un fantasma. Vidas restantes: ${this.vidas}`,
          timer: 1500,
          showConfirmButton: false
        });
        // Reubicar Pacman a inicio 
        this.pacmanPosition = { x: 1, y: 1 };
      } else {
        this.juegoTerminado = true;
        await this.guardarPuntajeSiEsMayor();
        Swal.fire({
          icon: 'error',
          title: '¡Perdiste!',
          text: `Te quedaste sin vidas. Puntaje: ${this.score}`,
          showCancelButton: true,
          confirmButtonText: 'Reiniciar',
          cancelButtonText: 'Volver al Menú',
          reverseButtons: true,
          allowOutsideClick: false,
        }).then((result) => {
          if (result.isConfirmed) {
            this.reiniciarJuego();
          } else {
            this.volverAlHome();
          }
        });
      }
      break; // salir del loop si hay colisión
    }
  }
}


  getCellClass(cell: number, rowIndex: number, colIndex: number) { 
    if (rowIndex === this.pacmanPosition.y && colIndex === this.pacmanPosition.x) return 'pacman';
    for (const ghost of this.ghostPositions) {
      if (rowIndex === ghost.y && colIndex === ghost.x) return 'ghost';
    }
    if (cell === 0) return 'coin';    
    return cell === 1 ? 'wall' : 'path';
  }

  moveButton(direction: string) {
    switch (direction) {
      case 'up':
        this.movePacman(-1,0);
        break;
      case 'down':
        this.movePacman(1,0);
        break;
      case 'left':
        this.movePacman(0,-1);
        break;
      case 'right':
        this.movePacman(0,1);
        break;
  }
}
startGhostMovement() { //se mueven aleatoriamente cada 500mts
  this.ghostInterval = setInterval(() => {
    if (this.juegoTerminado) return;

    for (const ghost of this.ghostPositions) {
      const directions = [
        { dx: -1, dy: 0 },
        { dx: 1, dy: 0 },
        { dx: 0, dy: -1 },
        { dx: 0, dy: 1 }
      ];
      const dir = directions[Math.floor(Math.random() * directions.length)];
      const newX = ghost.x + dir.dx;
      const newY = ghost.y + dir.dy;

      if (
        newX >= 0 && newX < this.board[0].length &&
        newY >= 0 && newY < this.board.length &&
        this.board[newY][newX] !== 1
      ) {
        ghost.x = newX;
        ghost.y = newY;
      }
    }

    this.checkCollision();
  }, 500);
}


  async verificarVictoria() {
    let monedasRestantes = 0;

    for (let fila of this.board) {
      for (let celda of fila) {
        if (celda === 2) monedasRestantes++;
      }
    }

    if (monedasRestantes === 0 ) {
      await this.guardarPuntajeSiEsMayor(); // GUARDAR PUNTAJE
      Swal.fire({
        icon: 'success',
        title: '¡Ganaste!',
        text: `¡Te comiste todas las monedas! Puntos: ${this.score}`,
        showCancelButton: true,
        confirmButtonText: 'Reiniciar',
        cancelButtonText: 'Volver al Menú',
        reverseButtons: true,
        allowOutsideClick: false,
      }).then((result) => {
        if (result.isConfirmed) {
          this.reiniciarJuego();
        } else if (result.dismiss === Swal.DismissReason.cancel) {
          this.volverAlHome();
        }
      });
    }
  }

 reiniciarJuego() {
  this.vidas = 3;
  this.score = 0;
  this.puntajeGuardado = false;
  this.pacmanPosition = { x: 1, y: 1 };
  this.ghostPositions = [
    { x: 9, y: 9 },
    { x: 11, y: 9 },
    { x: 13, y: 9 }
  ];
  this.juegoTerminado = false;
  this.initializeBoard();
}

  volverAlHome() {
    this.router.navigateByUrl('/home');
  }

  async guardarPuntajeSiEsMayor(): Promise<void> {
  if (this.puntajeGuardado) return;
  this.puntajeGuardado = true;

  const usuario = this.auth.currentUser;
  if (!usuario || !usuario.email) return;

  const email = usuario.email;
  const puntos = this.score;
  const fecha = new Date().toISOString();

  const coleccionRef = collection(this.firestore, 'pacman');
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

ngOnDestroy(): void {
  clearInterval(this.ghostInterval);
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
