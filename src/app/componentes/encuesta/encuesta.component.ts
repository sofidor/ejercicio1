import { Component, OnInit , inject} from '@angular/core';
import { FormGroup, FormControl, FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { addDoc, collection, Firestore } from '@angular/fire/firestore';
import { Router } from '@angular/router';
import { RouterModule } from '@angular/router';
import { Auth } from '@angular/fire/auth';
import { AuthService } from '../../servicios/auth.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-encuesta',
  standalone: true,
  imports: [ReactiveFormsModule, FormsModule, CommonModule,RouterModule],
  templateUrl: './encuesta.component.html',
  styleUrl: './encuesta.component.css'
})
export class EncuestaComponent implements OnInit {
  form!: FormGroup;
  submitted: boolean = false;

  userEmail: string | null = null;

  constructor(
    private fb: FormBuilder,
    private firestore: Firestore,
    private router: Router,
    private authService: AuthService

  ) {}

  ngOnInit(): void {
    const user = this.authService.getCurrentUser();
    if (user) {
      this.userEmail = user.email;
    }

    this.form = this.fb.group({
      nombre: ['', [Validators.pattern('^[a-zA-Z]+$'), Validators.required]],
      apellido: ['', [Validators.pattern('^[a-zA-Z]+$'), Validators.required]],
      edad: ['', [Validators.required, Validators.min(18), Validators.max(99)]],
      telefono: ['', [Validators.pattern('^[0-9]*$'), Validators.minLength(6), Validators.maxLength(10), Validators.required]],
      juegoFavorito: ['preguntados', Validators.required],
      juegoMenosFavorito: ['pacman', Validators.required],
      puntaje: ['5-7']
    });

  }

  get nombre() { return this.form.get('nombre'); }
  get apellido() { return this.form.get('apellido'); }
  get edad() { return this.form.get('edad'); }
  get telefono() { return this.form.get('telefono'); }

  enviarForm(): void {
    this.submitted = true;

    if (this.form.invalid) {
      return;
    }

    const fechaFormateada = new Date().toLocaleString('es-AR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
      second: 'numeric',
      hour12: false 
    });

    const encuesta = {
      fecha: fechaFormateada,
      email: this.userEmail ?? 'anónimo',
      nombre: this.form.value.nombre,
      apellido: this.form.value.apellido,
      edad: this.form.value.edad,
      telefono: this.form.value.telefono,
      juegoFavorito: this.form.value.juegoFavorito,
      juegoMenosFavorito: this.form.value.juegoMenosFavorito, 
      puntaje: this.form.value.puntaje
    };


    const col = collection(this.firestore, 'encuesta');
    addDoc(col, { encuesta });

  Swal.fire({
    icon: 'success',
    title: 'Encuesta enviada con éxito',
    timer: 2000,
    timerProgressBar: true,
    backdrop: true,
    allowOutsideClick: false,
    showConfirmButton: false,
  });

  }

  reiniciarPagina() {
    window.location.reload();
  }

  volverAlHome() {
    this.router.navigateByUrl('/home');
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
