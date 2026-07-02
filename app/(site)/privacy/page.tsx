import type { Metadata } from 'next';
import LegalPage from '@/app/components/legal/LegalPage';

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description:
    'How FinVidhi collects, uses, stores, and protects your personal information when you use our tax, GST, and compliance services.',
  alternates: { canonical: '/privacy' },
};

const LAST_UPDATED = '2 July 2026';

export default function PrivacyPolicyPage() {
  return (
    <LegalPage
      title="Privacy Policy"
      intro="How we collect, use, store, and protect your personal information when you use FinVidhi."
      lastUpdated={LAST_UPDATED}
      sections={[
        {
          id: 'introduction',
          heading: 'Introduction',
          body: (
            <>
              <p>
                FinVidhi (&quot;we&quot;, &quot;our&quot;, &quot;us&quot;) is a finance and tax compliance firm
                based in Delhi, India, providing GST, income tax, business registration, trademark &amp; IP,
                legal, IPO advisory, and banking &amp; finance services, along with free online tax calculators,
                through <strong>finvidhi.com</strong> (the &quot;Website&quot;).
              </p>
              <p>
                This Privacy Policy explains what information we collect, why we collect it, how we use and
                protect it, and the choices you have. It is published in accordance with the Information
                Technology Act, 2000, the Information Technology (Reasonable Security Practices and Procedures
                and Sensitive Personal Data or Information) Rules, 2011, and the Digital Personal Data
                Protection Act, 2023 (&quot;DPDP Act&quot;). By using the Website, you consent to the practices
                described in this policy.
              </p>
            </>
          ),
        },
        {
          id: 'information-we-collect',
          heading: 'Information We Collect',
          body: (
            <>
              <p>We collect only the information needed to respond to you and deliver our services:</p>
              <ul>
                <li>
                  <strong>Contact and enquiry details</strong> — when you submit our contact form, request a
                  callback, or raise a service enquiry, we collect your name, email address, phone number, the
                  subject/service of interest, and your message.
                </li>
                <li>
                  <strong>Service engagement information</strong> — when you engage us for tax or compliance
                  work, we may collect information necessary to perform that work, such as business details,
                  GST and PAN particulars, and supporting documents you choose to share with us.
                </li>
                <li>
                  <strong>Calculator inputs</strong> — figures you enter into our income tax, GST, EMI, HRA,
                  and TDS calculators are processed to show you results. These inputs are not linked to your
                  identity unless you separately contact us.
                </li>
                <li>
                  <strong>Technical information</strong> — standard server logs (IP address, browser type,
                  pages visited, timestamps) collected by our hosting infrastructure for security and
                  performance.
                </li>
              </ul>
              <p>
                We do not knowingly collect information from children under 18. Our services are intended for
                adults and businesses.
              </p>
            </>
          ),
        },
        {
          id: 'how-we-use',
          heading: 'How We Use Your Information',
          body: (
            <>
              <ul>
                <li>To respond to your enquiries, callback requests, and messages;</li>
                <li>To provide, administer, and improve the services you engage us for;</li>
                <li>To send you updates about your engagement, filings, and compliance deadlines;</li>
                <li>To maintain the security, performance, and reliability of the Website;</li>
                <li>To comply with legal obligations applicable to us as a professional services firm.</li>
              </ul>
              <p>
                We do <strong>not</strong> sell, rent, or trade your personal information to third parties for
                marketing purposes.
              </p>
            </>
          ),
        },
        {
          id: 'legal-basis',
          heading: 'Legal Basis and Consent',
          body: (
            <p>
              We process your personal data on the basis of your consent (which you give when you submit a form
              or engage our services), the performance of our engagement with you, and our legal obligations
              under Indian law — including tax, accounting, and professional record-keeping requirements. You
              may withdraw consent at any time by contacting us, subject to our legal retention obligations.
            </p>
          ),
        },
        {
          id: 'sharing',
          heading: 'Sharing and Third-Party Processors',
          body: (
            <>
              <p>
                We share information only with service providers that help us operate the Website, and only to
                the extent necessary:
              </p>
              <ul>
                <li>
                  <strong>Cloud hosting</strong> — our Website and API are hosted on DigitalOcean
                  infrastructure.
                </li>
                <li>
                  <strong>Database</strong> — data submitted through the Website is stored in MongoDB Atlas, a
                  managed cloud database service.
                </li>
                <li>
                  <strong>Media storage</strong> — images uploaded to the Website (for example, team photos and
                  blog images) are stored and served via Cloudinary.
                </li>
                <li>
                  <strong>Communication</strong> — if you choose &quot;Connect on WhatsApp&quot;, you will be
                  taken to WhatsApp, whose own privacy policy applies.
                </li>
              </ul>
              <p>
                We may also disclose information where required by law, court order, or a government authority
                empowered to seek it.
              </p>
            </>
          ),
        },
        {
          id: 'retention',
          heading: 'Data Retention',
          body: (
            <p>
              We retain enquiry and callback details for as long as needed to respond to and follow up on your
              request. Information connected to a professional engagement (for example, filings we prepare for
              you) is retained for the period required by applicable tax and professional regulations, after
              which it is deleted or anonymised. Calculator inputs are not retained beyond your session unless
              you submit them to us with an enquiry.
            </p>
          ),
        },
        {
          id: 'security',
          heading: 'How We Protect Your Data',
          body: (
            <>
              <ul>
                <li>All traffic to and from the Website is encrypted with HTTPS/TLS;</li>
                <li>Access to administrative systems is restricted to authorised personnel and protected by authentication;</li>
                <li>Data is stored with reputable cloud providers that maintain industry-standard security certifications;</li>
                <li>We follow reasonable security practices consistent with the SPDI Rules, 2011.</li>
              </ul>
              <p>
                No method of transmission or storage is completely secure. If we become aware of a data breach
                affecting your personal data, we will notify you and the relevant authorities as required by
                the DPDP Act, 2023.
              </p>
            </>
          ),
        },
        {
          id: 'your-rights',
          heading: 'Your Rights',
          body: (
            <>
              <p>Under the DPDP Act, 2023 and applicable rules, you have the right to:</p>
              <ul>
                <li>Access a summary of the personal data we hold about you;</li>
                <li>Request correction or updating of inaccurate or incomplete data;</li>
                <li>Request erasure of your personal data, subject to legal retention requirements;</li>
                <li>Withdraw consent for processing based on consent;</li>
                <li>Nominate another individual to exercise your rights in case of death or incapacity;</li>
                <li>Raise a grievance with us and, if unresolved, with the Data Protection Board of India.</li>
              </ul>
              <p>
                To exercise any of these rights, write to us at{' '}
                <a href="mailto:finvidhi@gmail.com" className="text-accent hover:underline">
                  finvidhi@gmail.com
                </a>
                . We will respond within a reasonable time and in any case within the period prescribed by law.
              </p>
            </>
          ),
        },
        {
          id: 'cookies',
          heading: 'Cookies',
          body: (
            <p>
              The Website uses a small number of cookies that are strictly necessary for it to function, such
              as authentication cookies for the administrative area. We do not currently use advertising or
              cross-site tracking cookies. For full details, see our{' '}
              <a href="/cookies" className="text-accent hover:underline">
                Cookie Policy
              </a>
              .
            </p>
          ),
        },
        {
          id: 'changes',
          heading: 'Changes to This Policy',
          body: (
            <p>
              We may update this Privacy Policy from time to time to reflect changes in our practices or the
              law. The &quot;Last updated&quot; date at the top shows when it was most recently revised.
              Material changes will be highlighted on the Website. Your continued use of the Website after an
              update constitutes acceptance of the revised policy.
            </p>
          ),
        },
        {
          id: 'grievance',
          heading: 'Grievance Officer',
          body: (
            <p>
              In accordance with the Information Technology Act, 2000 and rules made thereunder, grievances
              relating to personal data may be addressed to the Grievance Officer at FinVidhi, D-239, First
              Floor, Flat No-06, Street-10, Laxmi Nagar, Delhi — 110092, India, or by email at{' '}
              <a href="mailto:finvidhi@gmail.com" className="text-accent hover:underline">
                finvidhi@gmail.com
              </a>{' '}
              with the subject line &quot;Privacy Grievance&quot;.
            </p>
          ),
        },
      ]}
    />
  );
}
