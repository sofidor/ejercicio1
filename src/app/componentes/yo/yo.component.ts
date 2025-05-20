import { CommonModule } from '@angular/common';
import { Component,inject } from '@angular/core';
import { RouterLink, RouterLinkActive , Router} from '@angular/router';
import { Auth } from '@angular/fire/auth';
import { AuthService } from '../../servicios/auth.service';

import Swal from 'sweetalert2';

@Component({
  selector: 'app-yo',
  standalone: true,
  imports: [RouterLink,CommonModule],
  templateUrl: './yo.component.html',
  styleUrl: './yo.component.css'
})
export class YoComponent {
  userEmail: string | null = null;
  auth = inject(Auth);

  constructor( private authService : AuthService , private router: Router) {}

  ngOnInit(): void {
  const user = this.authService.getCurrentUser();
  if (user) { this.userEmail = user.email; }   
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
