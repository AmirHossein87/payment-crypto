import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  // Use signals for reactive, modern state management
  public isAuthenticated = signal<boolean>(false);

  constructor() {
    // In a real app, you'd check localStorage or a cookie here
    // for an existing token to set the initial state.
  }

  public login(): void {
    //
    // This is where you would call your AuthenticationClient
    // from api.ts, e.g., this.authClient.signIn(...)
    //
    // On success:
    // 1. Save the token
    // 2. Update the signal
    this.isAuthenticated.set(true);
  }

  public logout(): void {
    // 1. Clear the token
    // 2. Update the signal
    this.isAuthenticated.set(false);
  }
}
