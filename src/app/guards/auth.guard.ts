import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { Auth } from '@angular/fire/auth';
import { onAuthStateChanged } from 'firebase/auth';
import Swal from 'sweetalert2';

export const authGuard: CanActivateFn = (route, state) => {
  const auth = inject(Auth);
  const router = inject(Router);

  return new Promise<boolean>((resolve) => {
    onAuthStateChanged(auth, (user) => {
      if (user) {
        resolve(true); //  Usuario logueado -> entra
      } else {
        //  Usuario no logueado -> va al login
        Swal.fire({
          icon: 'warning',
          title: 'Acceso denegado',
          text: 'Debes iniciar sesión para acceder al chat',
          confirmButtonText: 'Entendido',
          background: '#1a1a1a',
          color: '#fff'
        }).then(() => {
          router.navigate(['/login']);
        });

        resolve(false);
      }
    });
  });
};
