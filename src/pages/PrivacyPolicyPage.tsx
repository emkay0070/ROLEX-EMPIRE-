import React from 'react';
import { AppRoute } from '../components/SiteLayout';

interface PrivacyPolicyPageProps {
  onNavigate: (route: AppRoute) => void;
}

export const PrivacyPolicyPage: React.FC<PrivacyPolicyPageProps> = ({ onNavigate }) => {
  const contactEmail = 'eoxystudio@gmail.com';

  return (
    <article className="max-w-4xl mx-auto px-4 sm:px-6 py-10 sm:py-14 space-y-8">
      <header className="space-y-3 border-b border-white/10 pb-8">
        <p className="text-xs font-semibold text-[#f59e0b]">Legal &amp; Transparency</p>
        <h1 className="font-display text-3xl sm:text-4xl font-extrabold text-[#f7f3eb]">
          Privacy Policy
        </h1>
        <p className="text-xs text-[#9c9286]">
          Effective Date: November 23, 2026 · Applies to Rolex Empire (Web Version 1.0)
        </p>
      </header>

      <div className="space-y-7 text-sm sm:text-base text-[#cfc6ba] leading-relaxed">
        <section className="space-y-2">
          <h2 className="font-display text-xl font-bold text-[#f7f3eb]">
            1. Overview &amp; Information We Collect
          </h2>
          <p>
            Rolex Empire is a browser-based simulation game that can be played without creating an
            account. We do not collect, sell, or store personal registration profiles on our own
            databases in Version 1.0.
          </p>
          <p>
            If you submit a message through our Contact page, the details you enter (such as your
            name, email address, and inquiry text) are used solely to respond to your support or
            feedback request.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="font-display text-xl font-bold text-[#f7f3eb]">
            2. Local Browser Storage (Game Progress)
          </h2>
          <p>
            To preserve your in-game UGX cash balance, stall level, unlocked upgrades, hired staff,
            and sound preferences across sessions, Rolex Empire uses your browser&apos;s{' '}
            <code>localStorage</code> under the key <code>rolex_empire_save_v1</code>. This data
            remains strictly on your device and can be cleared anytime from the in-game Upgrades
            panel (&ldquo;Reset Career Progress&rdquo;) or through your browser settings.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="font-display text-xl font-bold text-[#f7f3eb]">
            3. Advertising &amp; Google AdSense Cookies
          </h2>
          <p>
            To support free access to Rolex Empire, informational pages on this website are
            structured to display advertisements served by Google AdSense once enabled and approved.
          </p>
          <ul className="list-disc pl-6 space-y-1.5 text-sm text-[#bfb5a8]">
            <li>
              Third-party vendors, including Google, use cookies to serve ads based on a user&apos;s
              prior visits to this website or other websites on the internet.
            </li>
            <li>
              Google&apos;s use of advertising cookies enables it and its partners to serve ads to
              visitors based on their visit to this site and/or other sites on the internet.
            </li>
            <li>
              Users may opt out of personalized advertising by visiting{' '}
              <a
                href="https://adssettings.google.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#fcdc04] underline underline-offset-4"
              >
                Google Ads Settings
              </a>{' '}
              or opt out of a third-party vendor&apos;s use of cookies for personalized advertising
              by visiting{' '}
              <a
                href="https://www.aboutads.info/choices/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#fcdc04] underline underline-offset-4"
              >
                aboutads.info
              </a>
              .
            </li>
          </ul>
          <p>
            Advertisements are kept strictly on informational pages and are never placed over active
            3D gameplay controls.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="font-display text-xl font-bold text-[#f7f3eb]">
            4. Hosting Logs &amp; Security
          </h2>
          <p>
            Our static web hosting provider may process standard technical request metadata (such as
            IP address, browser user agent, and requested URL path) transiently in server logs for
            network delivery, uptime monitoring, and abuse prevention.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="font-display text-xl font-bold text-[#f7f3eb]">
            5. Children&apos;s Privacy
          </h2>
          <p>
            Rolex Empire does not knowingly collect personally identifiable information from children
            under the age of 13. If you believe a child has submitted personal information via our
            contact channels, please notify us immediately so we can delete it.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="font-display text-xl font-bold text-[#f7f3eb]">
            6. Contact &amp; Policy Updates
          </h2>
          <p>
            We may update this Privacy Policy as new features or cloud services are introduced in
            future versions. Any updates will be posted on this page with an updated effective date.
            For privacy questions,{' '}
            {contactEmail ? (
              <>
                email{' '}
                <a
                  href={`mailto:${contactEmail}`}
                  className="text-[#fcdc04] underline underline-offset-4"
                >
                  {contactEmail}
                </a>{' '}
                or{' '}
              </>
            ) : null}
            visit our{' '}
            <a
              href="/contact"
              onClick={(e) => {
                e.preventDefault();
                onNavigate('/contact');
              }}
              className="text-[#fcdc04] underline underline-offset-4"
            >
              Contact page
            </a>
            .
          </p>
        </section>
      </div>
    </article>
  );
};
