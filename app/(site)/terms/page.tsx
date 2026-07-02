import type { Metadata } from 'next';
import LegalPage from '@/app/components/legal/LegalPage';

export const metadata: Metadata = {
  title: 'Terms of Service',
  description:
    'The terms and conditions governing your use of finvidhi.com and FinVidhi\'s tax, GST, compliance, and advisory services.',
  alternates: { canonical: '/terms' },
};

const LAST_UPDATED = '2 July 2026';

export default function TermsOfServicePage() {
  return (
    <LegalPage
      title="Terms of Service"
      intro="The terms and conditions that govern your use of finvidhi.com and our professional services."
      lastUpdated={LAST_UPDATED}
      sections={[
        {
          id: 'acceptance',
          heading: 'Acceptance of These Terms',
          body: (
            <p>
              These Terms of Service (&quot;Terms&quot;) are an electronic record under the Information
              Technology Act, 2000 and constitute a binding agreement between you and FinVidhi
              (&quot;we&quot;, &quot;our&quot;, &quot;us&quot;), a finance and tax compliance firm based in
              Delhi, India. By accessing or using <strong>finvidhi.com</strong> (the &quot;Website&quot;) or
              engaging any of our services, you agree to be bound by these Terms and our{' '}
              <a href="/privacy" className="text-accent hover:underline">Privacy Policy</a>. If you do not
              agree, please do not use the Website.
            </p>
          ),
        },
        {
          id: 'services',
          heading: 'Our Services',
          body: (
            <>
              <p>FinVidhi provides professional services including:</p>
              <ul>
                <li>GST services — registration, return filing, annual returns, e-invoicing, LUT, amendments;</li>
                <li>Income tax services — ITR filing, TDS returns, tax planning, notice handling;</li>
                <li>Business registration — Private Limited, LLP, OPC, and proprietorship formation;</li>
                <li>Trademark &amp; IP — trademark registration, copyright, and patent filing support;</li>
                <li>Legal services — corporate, civil, and tax litigation support;</li>
                <li>IPO advisory and banking &amp; finance services;</li>
                <li>Free online calculators for income tax, GST, EMI, HRA, and TDS.</li>
              </ul>
              <p>
                The scope, fees, and timelines of any professional engagement are agreed separately with you
                before work begins. Prices shown on the Website are indicative and may vary with the
                complexity of your matter.
              </p>
            </>
          ),
        },
        {
          id: 'calculators',
          heading: 'Calculators and Informational Content',
          body: (
            <>
              <p>
                Our calculators, blog articles, compliance calendar, and other informational content are
                provided for <strong>general guidance only</strong>. They:
              </p>
              <ul>
                <li>do not constitute professional tax, legal, investment, or financial advice;</li>
                <li>may not reflect the most recent changes in tax rates, slabs, or law;</li>
                <li>should not be relied upon as the sole basis for any financial or filing decision.</li>
              </ul>
              <p>
                Always verify results with a qualified professional before acting on them. Engaging us for a
                specific service creates a professional relationship governed by the terms of that engagement.
              </p>
            </>
          ),
        },
        {
          id: 'your-obligations',
          heading: 'Your Obligations',
          body: (
            <>
              <p>When using the Website or our services, you agree to:</p>
              <ul>
                <li>Provide information that is true, accurate, current, and complete;</li>
                <li>Use the Website only for lawful purposes;</li>
                <li>Not attempt to gain unauthorised access to any part of the Website, its servers, or connected systems;</li>
                <li>Not interfere with the Website&apos;s operation, including by transmitting malware or launching automated attacks;</li>
                <li>Not copy, scrape, reproduce, or commercially exploit Website content without our written permission.</li>
              </ul>
              <p>
                The accuracy of filings and documents we prepare depends on the information you provide. You
                remain responsible for the completeness and truthfulness of that information.
              </p>
            </>
          ),
        },
        {
          id: 'fees',
          heading: 'Fees and Payment',
          body: (
            <p>
              Fees for professional services are communicated before an engagement begins and, unless stated
              otherwise, are exclusive of applicable taxes and government/statutory charges (which are payable
              in addition). Government fees paid on your behalf are non-refundable once remitted. Where a
              money-back assurance is offered for a specific service, its conditions will be stated in the
              engagement terms for that service.
            </p>
          ),
        },
        {
          id: 'ip',
          heading: 'Intellectual Property',
          body: (
            <p>
              All content on the Website — including the FinVidhi name and logo, text, graphics, page designs,
              calculators, and software — is owned by or licensed to FinVidhi and is protected under applicable
              intellectual property laws. You may view and print content for personal, non-commercial use.
              Any other use requires our prior written consent.
            </p>
          ),
        },
        {
          id: 'disclaimer',
          heading: 'Disclaimers',
          body: (
            <>
              <p>
                The Website is provided on an &quot;as is&quot; and &quot;as available&quot; basis. To the
                fullest extent permitted by law, we disclaim all warranties, express or implied, including
                fitness for a particular purpose and non-infringement. We do not warrant that:
              </p>
              <ul>
                <li>the Website will be uninterrupted, error-free, or free of harmful components;</li>
                <li>calculator outputs or informational content will be accurate or current at all times;</li>
                <li>outcomes of any filing or application (which rest with government authorities) will be favourable or within indicated timelines.</li>
              </ul>
            </>
          ),
        },
        {
          id: 'liability',
          heading: 'Limitation of Liability',
          body: (
            <p>
              To the maximum extent permitted by applicable law, FinVidhi shall not be liable for any
              indirect, incidental, special, consequential, or punitive damages, or for loss of profits,
              revenue, data, or goodwill, arising from your use of the Website or informational content. Our
              aggregate liability in connection with a professional engagement shall not exceed the fees paid
              by you to us for that engagement. Nothing in these Terms limits liability that cannot be limited
              under Indian law.
            </p>
          ),
        },
        {
          id: 'third-party',
          heading: 'Third-Party Links and Services',
          body: (
            <p>
              The Website may contain links to third-party websites and services (for example, WhatsApp,
              LinkedIn profiles, or government portals). We do not control and are not responsible for their
              content, policies, or practices. Your use of third-party services is at your own risk and
              subject to their terms.
            </p>
          ),
        },
        {
          id: 'termination',
          heading: 'Suspension and Termination',
          body: (
            <p>
              We may suspend or terminate your access to the Website, without notice, if you breach these
              Terms or use the Website in a manner that could harm us or others. Provisions relating to
              intellectual property, disclaimers, limitation of liability, and governing law survive
              termination.
            </p>
          ),
        },
        {
          id: 'governing-law',
          heading: 'Governing Law and Jurisdiction',
          body: (
            <p>
              These Terms are governed by and construed in accordance with the laws of India. Subject to any
              mandatory provisions of law, the courts at Delhi, India shall have exclusive jurisdiction over
              any dispute arising out of or relating to these Terms or your use of the Website.
            </p>
          ),
        },
        {
          id: 'changes',
          heading: 'Changes to These Terms',
          body: (
            <p>
              We may revise these Terms from time to time. The &quot;Last updated&quot; date at the top shows
              when they were most recently changed. Continued use of the Website after changes take effect
              constitutes acceptance of the revised Terms.
            </p>
          ),
        },
        {
          id: 'contact',
          heading: 'Contact Us',
          body: (
            <p>
              For questions about these Terms, contact us at{' '}
              <a href="mailto:finvidhi@gmail.com" className="text-accent hover:underline">
                finvidhi@gmail.com
              </a>{' '}
              or +91 96256 75722, or write to FinVidhi, D-239, First Floor, Flat No-06, Street-10, Laxmi
              Nagar, Delhi — 110092, India.
            </p>
          ),
        },
      ]}
    />
  );
}
