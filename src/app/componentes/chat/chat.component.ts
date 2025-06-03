import { Component, OnInit ,  ViewChild,
  ElementRef,
  AfterViewChecked ,inject} from '@angular/core';
import { ChatService } from '../../servicios/chat.service';
import { Auth } from '@angular/fire/auth';
import { AuthService } from '../../servicios/auth.service';
import { FormsModule } from '@angular/forms';
import { RouterLink ,Router} from '@angular/router';
import { CommonModule } from '@angular/common';
import { Observable } from 'rxjs';
import { Mensaje } from '../../interfaces/mensaje';

import Swal from 'sweetalert2';

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './chat.component.html',
  styleUrl: './chat.component.css'
})
export class ChatComponent implements OnInit, AfterViewChecked {
  message: string = '';
  messages$: Observable<Mensaje[]> | undefined;
  currentUserEmail: string = '';

  userEmail: string | null = null;

  @ViewChild('scrollMe') private scrollContainer!: ElementRef;

  constructor(
    private chatService: ChatService,
    private authService: AuthService,
    private router: Router
  ) {}

ngOnInit(): void {
  const user = this.authService.getCurrentUser();
  if (user) {
    this.currentUserEmail = user.email!;
    this.userEmail = user.email; 
  }

  this.messages$ = this.chatService.obtenerChats();
}

  ngAfterViewChecked(): void {
    this.scrollToBottom();
  }

  scrollToBottom(): void {
    try {
      this.scrollContainer.nativeElement.scrollTop =
        this.scrollContainer.nativeElement.scrollHeight;
    } catch (err) {
      console.error('Error al hacer scroll automático:', err);
    }
  }

  sendMessage() {
    if (this.message.trim()) {
      const user = this.authService.getCurrentUser();
      if (user) {
        const mensaje: Mensaje = {
          texto: this.message,
          timestamp: new Date(),
          nombre: user.email!
        };

        this.chatService.guardarChats(mensaje)
          .then(() => {
            this.message = '';            
          })
          .catch(error => {
            console.error('Error enviando el mensaje:', error);
          });
      }
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