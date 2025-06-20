import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () => import('./componentes/login/login.component').then(m => m.LoginComponent)
  },
  {
    path: 'home',
    loadComponent: () => import('./componentes/home/home.component').then(m => m.HomeComponent),
    canActivate: [authGuard]
  },
  {
    path: 'registro',
    loadComponent: () => import('./componentes/registro/registro.component').then(m => m.RegistroComponent)
  },
  {
    path: 'yo',
    loadComponent: () => import('./componentes/yo/yo.component').then(m => m.YoComponent)
  },
    {
    path: 'juegos',
    loadChildren: () => import('./module/juegos.module').then(m => m.JuegosModule)
  },
  // {
  //   path: 'pacman',
  //   loadComponent: () => import('./componentes/pacman/pacman.component').then(m => m.PacmanComponent)
  // },
  // {
  //   path: 'ahorcado',
  //   loadComponent: () => import('./componentes/ahorcado/ahorcado.component').then(m => m.AhorcadoComponent)
  // },
  // {
  //   path: 'mayorMenor',
  //   loadComponent: () => import('./componentes/mayormenor/mayormenor.component').then(m => m.MayormenorComponent)
  // },
  {
    path: 'chat',
    loadComponent: () => import('./componentes/chat/chat.component').then(m => m.ChatComponent),
    canActivate: [authGuard]
  },
  // {
  //   path: 'preguntados',
  //   loadComponent: () => import('./componentes/preguntados/preguntados.component').then(m => m.PreguntadosComponent)
  // },
  {
    path: 'encuesta',
    loadComponent: () => import('./componentes/encuesta/encuesta.component').then(m => m.EncuestaComponent)
  },
  {
    path: 'puntajes',
    loadComponent: () => import('./componentes/puntajes/puntajes.component').then(m => m.PuntajesComponent)
  },
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full'
  },
  {
  path: '**',
  loadComponent: () => import('./componentes/page-not-found/page-not-found.component').then(m => m.PageNotFoundComponent)
}
];
