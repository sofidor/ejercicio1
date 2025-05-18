import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { Router } from '@angular/router'; // Importa el Router
import{addDoc,collection,Firestore}from '@angular/fire/firestore';
import { Auth, signInWithEmailAndPassword } from '@angular/fire/auth';
import Swal from 'sweetalert2';



@Component({
  selector: 'app-login',
  standalone: true,
  imports: [RouterLink,CommonModule , FormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})

export class LoginComponent {

  public loginsCollection: any[] = [];
  public userMail: string = "";
  public userPass: string = "";
  public mensajeError: string = "";
  public loggedUser: string = "";  

  constructor(
    private firestore: Firestore, 
    private router: Router,
    private auth: Auth,
    //private authService: AuthService
  ) {}

  async LogIn(): Promise<void> {
    if (!this.userMail || !this.userPass) {
      this.mensajeError = "Por favor completa los campos.";
      return;
    }

    signInWithEmailAndPassword(this.auth, this.userMail, this.userPass)
      .then((res) => {
        this.router.navigate(['/home']);
        const col = collection(this.firestore, 'logins');
        return addDoc(col, { fecha: new Date(), email: this.userMail });
      })
      .then(() => {
        console.log('Registro de inicio de sesión guardado en Firestore.');
      })
      .catch((e) => {
        switch (e.code) {
          case 'auth/invalid-email':
            this.mensajeError = 'Email inválido';
            break;
          case 'auth/invalid-credential':
            this.mensajeError = 'Contraseña incorrecta';
            break;
          case 'auth/user-not-found':
            this.mensajeError = 'Usuario no encontrado';
            break;
          case 'auth/missing-password':
            this.mensajeError = 'Faltan completar campos';
            break;
          default:
            this.mensajeError = 'Ocurrió un error: ' + e.message;
            break;
        }
      });

      this.mostrarBienvenidaSweetAlert(this.userMail);
  }
  mostrarBienvenidaSweetAlert(email:string): void {
    Swal.fire({
      title: '¡Inicio de sesión exitoso!',
      text: email,
      timer: 2000,
      timerProgressBar: true,
      showConfirmButton: false,
      background: '#1a1a1a',
      color: '#00ffcc',
    });
  }
AutoComplete() {
  this.userMail = "sofiadorbe@gmail.com";  
  this.userPass = "hola123";        
}

}
