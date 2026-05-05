import { Component } from '@angular/core';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-login-page',
  standalone: true,
  template: `
    <div class="login-container">
      <!-- Decorative background orbs for Glassmorphism effect -->
      <div class="orb orb-1"></div>
      <div class="orb orb-2"></div>

      <div class="glass-card">
        <div class="header">
          <div class="logo-placeholder">JU</div>
          <h1>Welcome Back</h1>
          <p>Sign in to access your dashboard and events.</p>
        </div>

        <div class="auth-buttons">
          <button class="sso-btn google-btn" (click)="loginWithGoogle()">
            <svg viewBox="0 0 24 24" width="24" height="24" xmlns="http://www.w3.org/2000/svg">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Continue with Google
          </button>

          <button class="sso-btn microsoft-btn" (click)="loginWithMicrosoft()">
            <svg viewBox="0 0 21 21" width="24" height="24" xmlns="http://www.w3.org/2000/svg">
              <path fill="#f35325" d="M1 1h9v9H1z"/>
              <path fill="#81bc06" d="M11 1h9v9h-9z"/>
              <path fill="#05a6f0" d="M1 11h9v9H1z"/>
              <path fill="#ffba08" d="M11 11h9v9h-9z"/>
            </svg>
            Continue with Microsoft
          </button>
        </div>

        <div class="footer">
          <p>By signing in, you agree to our <a href="#">Terms of Service</a>.</p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    /* Import modern typography */
    @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;600&display=swap');

    :host {
      display: block;
      min-height: 100vh;
      background-color: #0b1120; /* Deep Jala Navy Background */
      font-family: 'Outfit', sans-serif;
      overflow: hidden;
      position: relative;
    }

    .login-container {
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
      position: relative;
      z-index: 1;
    }

    /* Decorative Orbs for Glassmorphism */
    .orb {
      position: absolute;
      border-radius: 50%;
      filter: blur(80px);
      z-index: -1;
      animation: float 10s infinite ease-in-out alternate;
    }

    .orb-1 {
      width: 400px;
      height: 400px;
      background: rgba(6, 182, 212, 0.4); /* Cyan/Blue */
      top: 10%;
      left: 20%;
    }

    .orb-2 {
      width: 300px;
      height: 300px;
      background: rgba(59, 130, 246, 0.3); /* Royal Blue */
      bottom: 20%;
      right: 20%;
      animation-delay: -5s;
    }

    @keyframes float {
      0% { transform: translateY(0) scale(1); }
      100% { transform: translateY(30px) scale(1.1); }
    }

    /* Glass Card */
    .glass-card {
      background: rgba(30, 41, 59, 0.6); /* Semi-transparent slate */
      backdrop-filter: blur(16px);
      -webkit-backdrop-filter: blur(16px);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 24px;
      padding: 3rem;
      width: 100%;
      max-width: 440px;
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
      color: #f8fafc;
      text-align: center;
    }

    .header {
      margin-bottom: 2.5rem;
    }

    .logo-placeholder {
      width: 64px;
      height: 64px;
      background: linear-gradient(135deg, #06b6d4, #3b82f6);
      border-radius: 16px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.5rem;
      font-weight: 600;
      color: white;
      margin: 0 auto 1.5rem auto;
      box-shadow: 0 10px 20px -5px rgba(59, 130, 246, 0.5);
    }

    .header h1 {
      font-size: 2rem;
      font-weight: 600;
      margin: 0 0 0.5rem 0;
      background: linear-gradient(to right, #f8fafc, #94a3b8);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }

    .header p {
      color: #94a3b8;
      font-size: 1rem;
      margin: 0;
    }

    /* Buttons */
    .auth-buttons {
      display: flex;
      flex-direction: column;
      gap: 1rem;
      margin-bottom: 2rem;
    }

    .sso-btn {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.75rem;
      width: 100%;
      padding: 0.875rem 1rem;
      font-size: 1rem;
      font-weight: 500;
      font-family: inherit;
      color: #f8fafc;
      background: rgba(15, 23, 42, 0.6);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 12px;
      cursor: pointer;
      transition: all 0.3s ease;
    }

    .sso-btn:hover {
      background: rgba(30, 41, 59, 0.8);
      transform: translateY(-2px);
      box-shadow: 0 10px 20px -10px rgba(0, 0, 0, 0.5);
      border-color: rgba(255, 255, 255, 0.2);
    }

    .sso-btn:active {
      transform: translateY(0);
    }

    .sso-btn svg {
      flex-shrink: 0;
    }

    /* Footer */
    .footer {
      border-top: 1px solid rgba(255, 255, 255, 0.05);
      padding-top: 1.5rem;
    }

    .footer p {
      color: #64748b;
      font-size: 0.875rem;
      margin: 0;
    }

    .footer a {
      color: #3b82f6;
      text-decoration: none;
      transition: color 0.2s ease;
    }

    .footer a:hover {
      color: #60a5fa;
      text-decoration: underline;
    }
  `]
})
export class LoginPage {
  loginWithGoogle(): void {
    window.location.href = `${environment.apiUrl}/auth/google`;
  }

  loginWithMicrosoft(): void {
    window.location.href = `${environment.apiUrl}/auth/microsoft`;
  }
}
