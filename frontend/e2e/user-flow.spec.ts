import { test, expect } from '@playwright/test';

// Generate a valid mock JWT with a payload containing role: 'user'
const mockUserPayload = {
  sub: 'b3c9f28d-12ab-34cd-56ef-7890abcdef12',
  email: 'john.doe@jala.university',
  role: 'user'
};
const encodedPayload = Buffer.from(JSON.stringify(mockUserPayload)).toString('base64');
const mockToken = `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.${encodedPayload}.mocksignature`;

const mockEventId = 'e5c6a1d8-4321-abcd-ef01-23456789abcd';
const mockEvent = {
  id: mockEventId,
  title: 'Introduction to AI Agent Systems',
  description: 'Learn how to build autonomous agentic workflows using the latest tools and SDKs.',
  location: 'Jala University Main Auditorium',
  meeting_url: null,
  event_type: 'in_person',
  status: 'published',
  starts_at: new Date(Date.now() + 86400000 * 2).toISOString(), // 2 days in the future
  ends_at: new Date(Date.now() + 86400000 * 2 + 10800000).toISOString(),
  capacity: 50,
  banner_url: null,
  calendar_uid: 'uid-ai-agents-2026',
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  registered_count: 5,
  tags: [
    { id: 'tag-1', name: 'AI', slug: 'ai' },
    { id: 'tag-2', name: 'Agents', slug: 'agents' }
  ]
};

test.describe('Normal User Flow E2E Test', () => {
  let registrationState: any = null;

  test.beforeEach(async ({ page }) => {
    // 1. Mock GET /auth/me for Profile fetching
    await page.route('**/auth/me', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          id: mockUserPayload.sub,
          full_name: 'John Doe',
          email: mockUserPayload.email,
          avatar_url: null,
          provider: 'google',
          role: mockUserPayload.role
        })
      });
    });

    // 2. Mock GET /events for Event Listing
    await page.route('**/events?page=1&limit=10&includeAll=false', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          data: [mockEvent],
          meta: {
            total: 1,
            page: 1,
            limit: 10,
            totalPages: 1
          }
        })
      });
    });

    // 3. Mock GET /events/:id for Event Details
    await page.route(new RegExp(`\\/events\\/${mockEventId}$`), async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(mockEvent)
      });
    });

    // 4. Mock GET /events/:id/registrations for user's registration state
    await page.route(new RegExp(`\\/events\\/${mockEventId}\\/registrations$`), async (route) => {
      if (route.request().method() === 'GET') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify(registrationState)
        });
      } else if (route.request().method() === 'POST') {
        registrationState = {
          id: 'reg-9876',
          event_id: mockEventId,
          user_id: mockUserPayload.sub,
          status: 'confirmed',
          registered_at: new Date().toISOString()
        };
        await route.fulfill({
          status: 201,
          contentType: 'application/json',
          body: JSON.stringify(registrationState)
        });
      } else if (route.request().method() === 'DELETE') {
        registrationState = null;
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ success: true })
        });
      }
    });

    // 5. Mock POST /events/:id/sync-calendar
    await page.route(new RegExp(`\\/events\\/${mockEventId}\\/sync-calendar$`), async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ url: 'https://calendar.google.com/test-mock-url' })
      });
    });

    // 6. Navigate to root, set token in localStorage, then navigate to events page
    await page.goto('/');
    await page.evaluate((t) => localStorage.setItem('token', t), mockToken);
    await page.goto('/events');
    await page.waitForLoadState('networkidle');
  });

  test('should display the events list and successfully register, sync calendar, and cancel registration', async ({ page }) => {
    // Ensure we are logged in and our user profile is displayed
    const userButton = page.locator('button:has-text("JD")'); // "JD" represents initials for "John Doe"
    // Wait for the mock events list to render
    const eventCard = page.locator('h3', { hasText: 'Introduction to AI Agent Systems' });
    await expect(eventCard).toBeVisible();

    // Click the event card to view its details
    await eventCard.click();
    await page.waitForURL(new RegExp(`\\/events\\/${mockEventId}`));

    // Verify event details
    await expect(page.locator('h1')).toHaveText('Introduction to AI Agent Systems');
    await expect(page.locator('text=Jala University Main Auditorium')).toBeVisible();

    // Verify registration section shows "Register" initially
    const registerButton = page.locator('button', { hasText: 'Register' });
    await expect(registerButton).toBeVisible();

    // Click register
    await registerButton.click();

    // Verify UI updates to show waitlist/registered state
    await expect(page.locator('text=You\'re registered!')).toBeVisible();

    // Verify "Add to Google Calendar" button is visible
    const googleCalendarButton = page.locator('button', { hasText: 'Add to Google Calendar' });
    await expect(googleCalendarButton).toBeVisible();

    // Mock window.open to assert it is called on sync
    await page.evaluate(() => {
      window.open = (url) => {
        (window as any)._lastOpenedUrl = url;
        return null;
      };
    });
    await googleCalendarButton.click();

    // Verify it was called with correct URL
    const lastOpenedUrl = await page.evaluate(() => (window as any)._lastOpenedUrl);
    expect(lastOpenedUrl).toBe('https://calendar.google.com/test-mock-url');

    // Click Cancel Registration
    const cancelButton = page.locator('button', { hasText: 'Cancel registration' });
    await expect(cancelButton).toBeVisible();
    await cancelButton.click();

    // Verify the UI reverts to "Register" button
    await expect(page.locator('button', { hasText: 'Register' })).toBeVisible();
  });
});
