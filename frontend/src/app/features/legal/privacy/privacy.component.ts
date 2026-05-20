import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-privacy',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="max-w-4xl mx-4 md:mx-auto my-6 md:my-12 p-6 md:p-10 bg-[var(--bg-glass)] border border-[var(--border-color)] rounded-2xl backdrop-blur-xl">
      <a routerLink="/" class="inline-flex items-center gap-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors mb-6 md:mb-8">
        <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
        </svg>
        Back to Home
      </a>

      <h1 class="text-2xl md:text-4xl font-bold text-[var(--text-primary)] mb-6 md:mb-8">Privacy Policy</h1>
      
      <div class="space-y-6 text-[var(--text-secondary)] leading-relaxed">
        <section>
          <h2 class="text-xl font-semibold text-[var(--text-primary)] mb-3">1. Information Collection</h2>
          <p>We collect information you provide directly to us when using Event Manager JalaU, including your name, email address, and profile picture provided through Google or Microsoft OAuth.</p>
        </section>

        <section>
          <h2 class="text-xl font-semibold text-[var(--text-primary)] mb-3">2. Calendar Access</h2>
          <p>Our application requests access to your Google or Microsoft Calendar events. This permission is used exclusively to:</p>
          <ul class="list-disc ml-6 mt-2 space-y-2">
            <li>Sync university events to your personal calendar.</li>
            <li>Create event entries on your behalf when you click the synchronization button.</li>
          </ul>
          <p class="mt-2 font-medium text-blue-400">We do not read, modify, or delete any of your pre-existing personal events.</p>
        </section>

        <section>
          <h2 class="text-xl font-semibold text-[var(--text-primary)] mb-3">3. Data Usage</h2>
          <p>The data we collect is used solely to manage your registrations and provide the calendar integration service. We do not sell or share your personal data with third parties.</p>
        </section>

        <section>
          <h2 class="text-xl font-semibold text-[var(--text-primary)] mb-3">4. Data Security</h2>
          <p>We implement professional security measures, including OAuth2 encryption and secure token storage, to protect your authentication data.</p>
        </section>

        <footer class="pt-8 border-t border-[var(--border-color)] mt-8">
          <p class="text-sm">Last updated: May 7, 2026</p>
        </footer>
      </div>
    </div>
  `
})
export class PrivacyComponent {}
