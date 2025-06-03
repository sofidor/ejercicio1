import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Auth } from '@angular/fire/auth';
import { AuthService } from '../servicios/auth.service';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { AhorcadoComponent } from '../componentes/ahorcado/ahorcado.component';
import { PacmanComponent } from '../componentes/pacman/pacman.component';
import { MayormenorComponent } from '../componentes/mayormenor/mayormenor.component';
import { PreguntadosComponent } from '../componentes/preguntados/preguntados.component';
import { RouterModule } from '@angular/router';
import { PuntajesService } from '../servicios/puntajes.service';
import { PreguntadosService } from '../servicios/preguntados.service';

@NgModule({
  declarations: [
    AhorcadoComponent,
    PacmanComponent,
    MayormenorComponent,
    PreguntadosComponent
  ],
  imports:[
    CommonModule,
    HttpClientModule,
    RouterModule.forChild([
    {path: 'ahorcado', component:AhorcadoComponent},
    {path: 'mayorMenor', component:MayormenorComponent},
    {path: 'preguntados', component:PreguntadosComponent},
    {path: 'pacman', component:PacmanComponent}
  ]),
],

  providers: [PreguntadosService,PuntajesService,AuthService],

})
export class JuegosModule { }
