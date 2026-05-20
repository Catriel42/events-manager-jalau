import { Component, inject } from '@angular/core';
import { environment } from '@env/environment';
import { ThemeService } from '@core/services/theme.service';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-login-page',
  imports: [RouterLink],
  templateUrl: './login-page.html',
  styleUrl: './login-page.css',
})
export class LoginPage {
  public themeService = inject(ThemeService);

  loginWithGoogle(): void {
    window.location.href = `${environment.apiUrl}/auth/google`;
  }

  loginWithMicrosoft(): void {
    window.location.href = `${environment.apiUrl}/auth/microsoft`;
  }
}