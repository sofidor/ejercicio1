import { Component, OnInit, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import Swal from 'sweetalert2';
import { Auth } from '@angular/fire/auth';
import { AuthService } from '../../servicios/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterLink, CommonModule],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  userEmail: string | null = null;
  auth = inject(Auth);

  constructor(
  private authService: AuthService,
  private router: Router
) {}

  ngOnInit(): void {
    // const user = this.auth.currentUser;
    // if (user && user.email) {
    //   this.userEmail = user.email;

      this.authService.getUserEmailObservable().subscribe(mail => {
      this.userEmail = mail;
    })
      

      // const yaMostrado = sessionStorage.getItem('bienvenida_mostrada');
      // if (!yaMostrado) {
      //   this.mostrarBienvenidaSweetAlert();
      //   sessionStorage.setItem('bienvenida_mostrada', 'true');
      // }
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
