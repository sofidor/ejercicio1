import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import {Auth, createUserWithEmailAndPassword} from '@angular/fire/auth';
import { Firestore, addDoc, collection } from '@angular/fire/firestore';

@Component({
  selector: 'app-registro',
  standalone: true,
  imports: [RouterLink,RouterLinkActive,CommonModule , FormsModule],
  templateUrl: './registro.component.html',
  styleUrl: './registro.component.css'
})
export class RegistroComponent {

  newUserMail: string = "";
  newUsername: string = "";
  newUserPass: string = "";
  newUserRepeatPass: string = "";

  msjError: string = "";

  constructor(
    public auth: Auth, 
    private firestore: Firestore,
    private router: Router
  ) {}
  
  Register() {
    
      if (this.newUserPass.length < 6) {
        this.msjError = 'La contraseña debe tener al menos 6 caracteres';
        return;
      }
    
  if (this.newUserPass === this.newUserRepeatPass) {
    createUserWithEmailAndPassword(this.auth, this.newUserMail, this.newUserPass)
      .then((res) => {
        console.log('Usuario creado correctamente');
        const col = collection(this.firestore, 'users');
        addDoc(col, { fecha: new Date(), email: this.newUserMail })
          .then(() => {
            this.router.navigate(['/home']);
          })
          .catch((error) => {
            this.msjError = 'Error al agregar usuario a la base de datos';
            console.error('Error al agregar documento:', error);
          });
      })
      .catch((e) => {
        switch (e.code) {
          case 'auth/invalid-email':
            this.msjError = 'Email inválido';
            break;
          case 'auth/email-already-in-use':
            this.msjError = 'Email ya en uso';
            break;
          case 'auth/missing-password':
            this.msjError = 'Faltan completar campos';
            break;
          case 'auth/weak-password':
            this.msjError = 'La contraseña es demasiado débil';
            break;
          default:
            this.msjError = 'Ocurrió un error';
            break;
        }
      });
  } else {
    this.msjError = 'Las contraseñas no coinciden';
  }


}
}