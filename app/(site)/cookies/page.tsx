import type { Metadata } from 'next';
import LegalPage from '@/app/components/legal/LegalPage';

export const metadata: Metadata = {
  title: 'Cookie Policy',
  description:
    'How finvidhi.com uses cookies and similar technologies — what we set, why, and how you can control them.',
  alternates: { canonical: '/cookies' },
};

const LAST_UPDATED = '2 July 2026';

export default function CookiePolicyPage() {
  return (
    <LegalPage
      title="Cookie Policy"
      intro="What cookies and similar technologies finvidhi.com uses, why we use them, and how you can control them."
      lastUpdated={LAST_UPDATED}
      sections={[
        {
          id: 'what-are-cookies',
          heading: 'What Are Cookies?',
          body: (
            <p>
              Cookies are small text files that a website stores on your device when you visit it. They help
              the site remember your actions and preferences (such as a login session) so you don&apos;t have
              to re-enter them on every page. Similar technologies include browser{' '}
              <strong>localStorage</strong>, which stores small pieces of data in your browser until removed.
            </p>
          ),
        },
        {
          id: 'how-we-use',
          heading: 'How FinVidhi Uses Cookies',
          body: (
            <>
              <p>
                We keep our use of cookies deliberately minimal. finvidhi.com uses{' '}
                <strong>strictly necessary</strong> cookies only — the ones required for the Website to
                function. We do <strong>not</strong> use advertising cookies, cross-site tracking cookies, or
                third-party analytics cookies at this time.
              </p>
              <p>The cookies and storage we set are:</p>
              <ul>
                <li>
                  <strong>admin_token</strong> (cookie, HttpOnly) — keeps authorised administrators signed in
                  to the site&apos;s management area. Set only after an admin logs in; expires after 24 hours.
                  Regular visitors never receive this cookie.
                </li>
                <li>
                  <strong>admin_token_access</strong> (cookie) — companion token used by the management
                  area&apos;s pages to authenticate requests to our API. Also set only for administrators;
                  expires after 24 hours.
                </li>
                <li>
                  <strong>authToken</strong> (localStorage) — created only if you sign in to a user account,
                  to keep you logged in. It remains until you log out or clear your browser storage.
                </li>
              </ul>
              <p>
                If you simply browse the public website — the homepage, services, calculators, blog, and
                contact pages — no identifying cookies are set for you.
              </p>
            </>
          ),
        },
        {
          id: 'third-party',
          heading: 'Third-Party Content',
          body: (
            <>
              <p>Some content on the Website is delivered by third parties, which may set their own cookies or receive standard technical data (like your IP address) when your browser loads their content:</p>
              <ul>
                <li>
                  <strong>Cloudinary</strong> — serves images (team photos, blog covers) from its CDN;
                </li>
                <li>
                  <strong>Google Fonts</strong> — serves the typefaces used on the Website;
                </li>
                <li>
                  <strong>WhatsApp / LinkedIn</strong> — only if you click a &quot;Connect on WhatsApp&quot;
                  button or a team member&apos;s LinkedIn link, you leave our Website and those platforms&apos;
                  own cookie and privacy policies apply.
                </li>
              </ul>
            </>
          ),
        },
        {
          id: 'managing',
          heading: 'Managing Cookies',
          body: (
            <>
              <p>You can control and delete cookies through your browser settings:</p>
              <ul>
                <li>Block or delete all cookies, or only third-party cookies;</li>
                <li>Clear cookies and site data when you close the browser;</li>
                <li>Browse in private/incognito mode so cookies are discarded automatically.</li>
              </ul>
              <p>
                Because our cookies are strictly necessary, blocking them does not affect your ability to
                browse the public website — but administrators will not be able to sign in to the management
                area, and signed-in users may be logged out.
              </p>
              <p>
                Instructions for popular browsers: Chrome (Settings → Privacy and security → Cookies), Safari
                (Preferences → Privacy), Firefox (Settings → Privacy &amp; Security), and Edge (Settings →
                Cookies and site permissions).
              </p>
            </>
          ),
        },
        {
          id: 'changes',
          heading: 'Changes to This Policy',
          body: (
            <p>
              If we introduce new cookies (for example, analytics to understand how the Website is used), we
              will update this policy and, where required by law, ask for your consent before setting them.
              The &quot;Last updated&quot; date at the top shows the most recent revision.
            </p>
          ),
        },
        {
          id: 'contact',
          heading: 'Contact Us',
          body: (
            <p>
              Questions about our use of cookies? Email{' '}
              <a href="mailto:finvidhi@gmail.com" className="text-accent hover:underline">
                finvidhi@gmail.com
              </a>{' '}
              or see our{' '}
              <a href="/privacy" className="text-accent hover:underline">
                Privacy Policy
              </a>{' '}
              for how we handle personal data generally.
            </p>
          ),
        },
      ]}
    />
  );
}
