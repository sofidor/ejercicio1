import { Injectable } from '@angular/core';
import { signOut } from 'firebase/auth';
import { getAuth, onAuthStateChanged, User } from 'firebase/auth';
import { BehaviorSubject, Observable , from} from 'rxjs';
import { Auth } from '@angular/fire/auth';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private auth = getAuth();
  private user: User | null = null;
   observable! : Observable<User | null>;
  private userEmail$ = new BehaviorSubject<string | null>(null);

  constructor() {
    onAuthStateChanged(this.auth, (user) => {
      this.user = user;
      this.userEmail$.next(user?.email ?? null);
    });
  }

  getCurrentUser(): User | null {
    return this.user;
  }

    logOut():Observable<void>
  {
      const promise = signOut(this.auth);     
      return from (promise);
  }

  getUserEmailObservable(): Observable<string | null> {
    return this.userEmail$.asObservable();
  }
}
