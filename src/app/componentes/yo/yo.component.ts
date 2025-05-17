import { CommonModule } from '@angular/common';
import { Component,inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { Auth } from '@angular/fire/auth';
import { AuthService } from '../../servicios/auth.service';

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

  constructor( private authService : AuthService ) {}

  ngOnInit(): void {
  const user = this.authService.getCurrentUser();
  if (user) { this.userEmail = user.email; }   
  }
  

}
