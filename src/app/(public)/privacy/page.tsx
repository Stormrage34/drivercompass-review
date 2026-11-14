import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Privacy notice",
  description: "How DriverCompass processes driver, employer and visitor personal data.",
};

export default function PrivacyPage() {
  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-10 sm:px-6">
      <p className="text-[0.7rem] font-semibold uppercase tracking-[0.16em] text-muted">Legal</p>
      <h1 className="mt-2 text-3xl font-semibold tracking-tight">Privacy notice</h1>
      <p className="mt-2 text-xs text-muted">Version 1.0 · 12 November 2026 · pilot draft pending legal review</p>

      <div className="prose-legal mt-8 max-w-none">
        <p>
          This notice explains how DriverCompass (“we”) processes personal data when you use this pilot
          platform. It applies to drivers, employer representatives, reviewers and visitors. We are the
          controller for account, profile, review, moderation and enquiry data processed on the platform.
          An employer is a separate controller for the recruitment process it runs after you contact it.
        </p>

        <h2>1. Data we process</h2>
        <ul>
          <li><strong>Account data:</strong> name, email address, password hash, role, login timestamps, session records.</li>
          <li><strong>Driver profile data (private by default):</strong> country of residence, languages, licence categories, Code 95 status, ADR classes, experience, preferences, optional phone and contact email.</li>
          <li><strong>Enquiry data:</strong> the message you send to an employer, the vacancies you contact, and the contact details you explicitly choose to share.</li>
          <li><strong>Review data:</strong> reviews are closed in this build; historical review records, if any, contain ratings, employment period, text and moderation notes.</li>
          <li><strong>Newsletter data:</strong> your email address, the date and wording version of your opt-in, and your subscription status.</li>
          <li><strong>Employer data:</strong> company identity, registration number, registered address, contact person, business email and verification evidence.</li>
          <li><strong>Technical data:</strong> IP address, user agent, security events and audit records for administrative actions.</li>
        </ul>

        <h2>2. Why we use it and on what basis</h2>
        <ul>
          <li><strong>Providing the service</strong> (account, profile, search, enquiries): performance of a contract.</li>
          <li><strong>Pilot updates by email:</strong> your consent, given by ticking the newsletter box. It is optional, unticked by default, and can be withdrawn in settings.</li>
          <li><strong>Sharing contact details with an employer:</strong> your consent, given by ticking the sharing box for that enquiry. You can withhold it and still send a message.</li>
          <li><strong>Verification and fraud prevention:</strong> legitimate interests in keeping the marketplace honest, plus legal obligations for records of verification decisions.</li>
          <li><strong>Moderation and legal claims:</strong> legitimate interests in preventing abuse, defamation and unlawful content, and in establishing or defending legal claims.</li>
          <li><strong>Security and audit logs:</strong> legitimate interests in protecting the platform and its users.</li>
        </ul>

        <h2>3. What we do not do</h2>
        <ul>
          <li>We do not sell driver profiles or personal data.</li>
          <li>We do not make driver profiles, CVs, phone numbers or email addresses public.</li>
          <li>We do not let employers browse identifiable drivers; drivers choose who receives their details.</li>
          <li>We do not disclose to an employer that a driver is looking for work unless the driver contacts that employer.</li>
          <li>We do not use advertising trackers or third-party analytics in this pilot build.</li>
        </ul>

        <h2>4. Cookies</h2>
        <p>
          We use one essential cookie (<code>df_session</code>) to keep you signed in. It is HTTP-only,
          same-site and expires after 30 days. No analytics, advertising or cross-site cookies are set.
        </p>

        <h2>5. Recipients and processors</h2>
        <p>
          Data is processed on infrastructure selected for the pilot. Access is limited to the small
          pilot operators and moderators who need it. Where an employer receives your enquiry, it receives
          your display name, message and only the contact details you chose to share. That employer then
          processes the data for its own recruitment purposes under its own privacy notice.
        </p>
        <p>
          Sub-processors (hosting, transactional email, backup) are bound by data processing agreements and
          may only process data on our instructions. A current list will be published with the approved notice.
        </p>

        <h2>6. Retention</h2>
        <ul>
          <li>Account and profile data: until you delete your account.</li>
          <li>Newsletter preference: until you unsubscribe or delete your account.</li>
          <li>Session records: 30 days, or until sign-out.</li>
          <li>Enquiries: 24 months after the last activity, unless a legal claim requires longer.</li>
          <li>Published reviews: while published. If you delete your account, the review is kept without your name, pending the retention decision.</li>
          <li>Verification evidence and audit logs: up to 5 years where needed to demonstrate compliance.</li>
          <li>Security logs: 90 days, unless needed for an investigation.</li>
        </ul>

        <h2>7. Your rights</h2>
        <p>
          You may request access, rectification, erasure, restriction, portability, or object to processing
          based on legitimate interests. Where processing relies on consent, you may withdraw it at any
          time without affecting the lawfulness of prior processing. You can withdraw newsletter consent
          in account settings at any time; that does not stop account or security emails. You can request deletion from
          account settings; we email a single-use confirmation link to the registered address, and nothing
          is deleted until you confirm there. Deletion removes your login, profile, saved items and
          sessions, and clears shared contact details from your enquiries. Reviews and enquiry records are
          kept without your name pending the retention decision, and backups may retain copies for a
          limited period.
        </p>
        <p>
          You also have the right to lodge a complaint with a supervisory authority. Our lead authority for
          the pilot is the Bulgarian Commission for Personal Data Protection. If you work in another EU
          country, you may complain to your local authority.
        </p>

        <h2>8. Security</h2>
        <p>
          Passwords are stored as salted scrypt hashes. Sessions use random tokens stored as hashes, with
          HTTP-only cookies. Access is role-based and sensitive administrative actions are logged. No system is perfectly secure; if a breach affects your rights, we will
          notify you and the supervisory authority as required.
        </p>

        <h2>9. Automated decisions</h2>
        <p>
          We do not make automated decisions that produce legal or similarly significant effects about you.
          Moderation decisions are made or reviewed by a human moderator.
        </p>

        <h2>10. Children</h2>
        <p>The platform is for professional drivers and businesses. It is not intended for anyone under 18.</p>

        <h2>11. Changes and contact</h2>
        <p>
          We will publish a new version and date when this notice changes. Questions or requests: use the{" "}
          <Link href="/contact">contact page</Link> once a monitored route opens. No address is offered until then.
        </p>
        <p className="text-xs">
          This is a pilot draft. It is written to reflect the product’s actual data flows, but it must be
          reviewed by qualified counsel in each launch country before public launch.
        </p>
      </div>
    </div>
  );
}
