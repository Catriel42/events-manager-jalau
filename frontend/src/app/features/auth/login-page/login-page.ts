import { Component } from '@angular/core';
import { environment } from '@env/environment';

@Component({
  selector: 'app-login-page',
  imports: [],
  templateUrl: './login-page.html',
  styleUrl: './login-page.css',
})
export class LoginPage {
  loginWithGoogle(): void {
    window.location.href = `${environment.apiUrl}/auth/google`;
  }

  loginWithMicrosoft(): void {
    window.location.href = `${environment.apiUrl}/auth/microsoft`;
  }
}