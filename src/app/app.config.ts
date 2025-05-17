import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { RouterModule } from '@angular/router';
import { routes } from './app.routes';
import { initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { getAuth, provideAuth } from '@angular/fire/auth';
import { getFirestore, provideFirestore } from '@angular/fire/firestore';
import { provideHttpClient } from '@angular/common/http';


export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideHttpClient(), 
    provideFirebaseApp(() => initializeApp({
      projectId: 'salajuegos-4ae7b',
      appId: '1:503761293861:web:ab3251c9869b57c5df25cc',
      storageBucket: 'salajuegos-4ae7b.appspot.com',
      apiKey: 'AIzaSyA4ILBSXBbhBV67ikiunUgSE08pFJX5aMc',
      authDomain: 'salajuegos-4ae7b.firebaseapp.com',
      messagingSenderId: '503761293861'
    })),
    provideAuth(() => getAuth()),
    provideFirestore(() => getFirestore())
  ]
};

