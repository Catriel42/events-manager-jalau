import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '@core/services/auth.service';

@Component({
  selector: 'app-auth-callback',
  standalone: true,
  template: `
    <div class="callback-container">
      <div class="spinner-wrapper">
        <div class="spinner"></div>
        <h2>Authenticating...</h2>
        <p>Please wait while we securely log you in.</p>
      </div>
    </div>
  `,
  styles: [`
    @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;600&display=swap');

    :host {
      display: block;
      min-height: 100vh;
      background-color: #0b1120; /* Deep Jala Navy Background */
      font-family: 'Outfit', sans-serif;
      color: #f8fafc;
    }

    .callback-container {
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
    }

    .spinner-wrapper {
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;
    }

    .spinner {
      width: 60px;
      height: 60px;
      border: 4px solid rgba(255, 255, 255, 0.1);
      border-left-color: #06b6d4; /* Jala Cyan */
      border-right-color: #3b82f6; /* Jala Royal Blue */
      border-radius: 50%;
      animation: spin 1s linear infinite;
      margin-bottom: 2rem;
    }

    h2 {
      font-size: 1.5rem;
      font-weight: 600;
      margin: 0 0 0.5rem 0;
      background: linear-gradient(to right, #f8fafc, #94a3b8);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }

    p {
      color: #64748b;
      margin: 0;
    }

    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
  `]
})
export class AuthCallback implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private authService = inject(AuthService);

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      const token = params['token'];

      if (token) {
        this.authService.setToken(token);
        if (this.authService.isAdmin()) {
          this.router.navigate(['/dashboard']);
        } else {
          this.router.navigate(['/events']);
        }
      } else {
        this.router.navigate(['/auth/login']);
      }
    });
  }
}
