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
          <p>We collect information you provide directly to us when using Event Manager JalaU, including your name, email address, and profile picture provided through Google OAuth.</p>
        </section>

        <section>
          <h2 class="text-xl font-semibold text-[var(--text-primary)] mb-3">2. Calendar Access</h2>
          <p>Our application requests access to your Google Calendar events. This permission is used exclusively to:</p>
          <ul class="list-disc ml-6 mt-2 space-y-2">
            <li>Sync university events to your personal Google Calendar.</li>
            <li>Create, update, or cancel event entries on your behalf when you choose to synchronize an event.</li>
          </ul>
          <p class="mt-2 font-medium text-blue-400">We do not read, modify, or delete any of your pre-existing personal calendar events. We only manage events created by this application.</p>
        </section>

        <section>
          <h2 class="text-xl font-semibold text-[var(--text-primary)] mb-3">3. Data Sharing, Transfer, and Disclosure</h2>
          <p>We do not sell, rent, trade, share, transfer, or disclose Google user data (or any other personal data collected through our service) to any third parties. Your data is used strictly to provide and improve the event management and calendar synchronization services, in full compliance with the Google API Services User Data Policy.</p>
        </section>

        <section>
          <h2 class="text-xl font-semibold text-[var(--text-primary)] mb-3">4. Data Retention and Deletion</h2>
          <p>We retain your profile information and event registration data only for as long as your account remains active or as needed to provide you with our services. If you wish to delete your account or request the permanent deletion of all your collected data (including your profile information and Google OAuth tokens), you can contact us at <a href="mailto:event@events-jalau.me" class="text-blue-400 hover:underline">event@events-jalau.me</a>. Deletion requests are processed and completed within 30 days, after which your data is permanently purged from our active systems.</p>
        </section>

        <section>
          <h2 class="text-xl font-semibold text-[var(--text-primary)] mb-3">5. Data Security</h2>
          <p>We implement professional industry-standard security measures, including HTTPS encryption, secure OAuth2 protocols, and encrypted database storage for access/refresh tokens, to protect your data from unauthorized access, alteration, or destruction.</p>
        </section>

        <footer class="pt-8 border-t border-[var(--border-color)] mt-8">
          <p class="text-sm">Last updated: May 28, 2026</p>
        </footer>
      </div>
    </div>
  `
})
export class PrivacyComponent {}
