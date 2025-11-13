import React from "react";

const APP_NAME = "HangOut";
const SITE_URL = "https://gethangout.app";
const LAST_UPDATED = "November 13, 2025";
const CONTACT_EMAIL = "gethangout.team@gmail.com";
const GOVERNING_LAW = "the State of California, USA";

export default function PrivacyPolicy() {
  return (
    <main className="w-full flex justify-center ">
      <div className="max-w-5xl w-full px-4 py-30 text-black text-sm">
        <h1 className="text-3xl font-bold mb-4">Privacy Policy</h1>
        <div className="w-full h-0.5 bg-gray-300 mt-2 mb-6"></div>
        <p className="text-sm text-gray-600">Last Updated: {LAST_UPDATED}</p>

        <section>
          <h2 className="text-xl font-semibold mt-6 mb-2">1. Introduction</h2>
          <p className="mb-2">
            Welcome to {APP_NAME} ("we", "us", "our"). We provide an online
            platform located at{" "}
            <a
              href={SITE_URL}
              className="text-blue-600 underline"
              target="_blank"
              rel="noreferrer"
            >
              {SITE_URL}
            </a>{" "}
            (the "Service") that allows users to discover, join, and create
            events, connect with others around shared interests, and manage
            social gatherings.
          </p>
          <p>
            We value your privacy and are committed to protecting the personal
            data you share when using the Service. This Privacy Policy explains
            what information we collect, how we use it, how we share it, and
            your choices regarding your information.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mt-6 mb-2">
            2. Information We Collect
          </h2>

          <h3 className="text-lg font-semibold mt-4 mb-1">
            2.1 Information You Provide
          </h3>
          <ul className="list-disc list-inside space-y-1">
            <li>
              <strong>Account Registration:</strong> When you sign up, you may
              provide your name, email address, password, profile photo, general
              location (such as city or region), and interests.
            </li>
            <li>
              <strong>Event Creation and Participation:</strong> When you create
              or join events, you may provide event details such as title,
              description, date and time, location, and media. We also collect
              information about RSVPs, join requests, and any messages or
              comments you post.
            </li>
            <li>
              <strong>Profile and Preferences:</strong> We collect information
              you add to your profile and settings, such as interests, topics,
              and preferences for online or in person events.
            </li>
            <li>
              <strong>Support and Communications:</strong> When you contact us,
              you provide the content of your communications and any attachments
              you include.
            </li>
          </ul>

          <h3 className="text-lg font-semibold mt-4 mb-1">
            2.2 Information Collected Automatically
          </h3>
          <ul className="list-disc list-inside space-y-1">
            <li>
              <strong>Usage Data:</strong> We collect information about how you
              access and use the Service, such as IP address, browser type and
              version, device type, operating system, pages visited, referring
              and exit pages, and time spent on pages.
            </li>
            <li>
              <strong>Event and Interaction Data:</strong> We collect
              information about events you view, join, or create, filters you
              apply, and other interactions with the Service, including map
              views and search actions.
            </li>
            <li>
              <strong>Cookies and Similar Technologies:</strong> We use cookies,
              local storage, and similar technologies to enable core features,
              understand usage, and improve the Service. Some third party tools
              such as analytics providers may also use cookies.
            </li>
          </ul>

          <h3 className="text-lg font-semibold mt-4 mb-1">
            2.3 Location Information
          </h3>
          <p>
            If you enable location features, we may collect approximate or
            precise geographic location data from your device to show events
            near you and power location based features. You can control location
            collection through your device settings.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mt-6 mb-2">
            3. How We Use Your Information
          </h2>
          <p>We use the information we collect for the following purposes:</p>
          <ul className="list-disc list-inside space-y-1 mt-2">
            <li>
              <strong>Provide and maintain the Service:</strong> To operate the
              app, enable event creation and participation, manage RSVPs, and
              support core functionality.
            </li>
            <li>
              <strong>Personalize your experience:</strong> To suggest events,
              groups, and connections that may be relevant to you, and to
              customize content and recommendations.
            </li>
            <li>
              <strong>Communicate with you:</strong> To send service related
              messages such as confirmations, reminders, and important updates,
              and to send marketing or promotional communications if you choose
              to receive them.
            </li>
            <li>
              <strong>Improve and protect the Service:</strong> To analyze how
              the Service is used, diagnose issues, monitor performance, and
              develop new features.
            </li>
            <li>
              <strong>Legal and safety:</strong> To comply with legal
              obligations, enforce our Terms of Use, and protect the rights,
              property, or safety of our users and others.
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold mt-6 mb-2">
            4. Sharing and Disclosure of Information
          </h2>
          <ul className="list-disc list-inside space-y-1">
            <li>
              <strong>With Other Users:</strong> Some profile information such
              as your name, profile photo, and general location may be visible
              to other users. Event related information such as your RSVP status
              or participation may also be visible to event hosts and
              participants.
            </li>
            <li>
              <strong>Service Providers:</strong> We work with trusted third
              party service providers that perform functions on our behalf, such
              as hosting, analytics, email delivery, and customer support. They
              may have access to personal information only as needed to perform
              these services and are required to protect it.
            </li>
            <li>
              <strong>Legal Requirements:</strong> We may disclose personal
              information if required by law, legal process, or a governmental
              request, or to protect our rights or the rights of others.
            </li>
            <li>
              <strong>Business Transfers:</strong> If we are involved in a
              merger, acquisition, financing, or sale of assets, your
              information may be transferred as part of that transaction,
              subject to this Privacy Policy or a successor policy that provides
              similar protections.
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold mt-6 mb-2">
            5. Your Choices and Rights
          </h2>
          <ul className="list-disc list-inside space-y-1">
            <li>
              <strong>Account Information:</strong> You can access and update
              your profile and account information within the app at any time.
            </li>
            <li>
              <strong>Account Deletion:</strong> You can request deletion of
              your account. After deletion, your profile will no longer be
              visible to other users and we will delete or anonymize your
              personal data in line with our data retention practices, subject
              to legal requirements.
            </li>
            <li>
              <strong>Communications:</strong> You can manage email preferences
              through your account settings or by using the unsubscribe link in
              our emails. We may still send important service related messages.
            </li>
            <li>
              <strong>Cookies:</strong> You can control cookies through your
              browser settings. If you disable cookies, some features of the
              Service may not work as intended.
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold mt-6 mb-2">6. Data Retention</h2>
          <p>
            We keep personal information for as long as your account is active
            and as needed to provide the Service, comply with legal obligations,
            resolve disputes, and enforce our agreements. When personal
            information is no longer needed, we delete it or anonymize it in a
            secure manner.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mt-6 mb-2">7. Security</h2>
          <p>
            We use reasonable administrative, technical, and physical safeguards
            designed to protect personal information from unauthorized access,
            loss, misuse, or alteration. However, no method of transmission or
            storage is completely secure, so we cannot guarantee absolute
            security.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mt-6 mb-2">
            8. International Data Transfers
          </h2>
          <p>
            If you access the Service from outside the United States, your
            information may be transferred to, stored, and processed in the
            United States or other countries where our service providers are
            located. By using the Service, you consent to these transfers, which
            may have different data protection rules than your country.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mt-6 mb-2">
            9. Children&apos;s Privacy
          </h2>
          <p>
            The Service is not directed to children under 13 years of age, or a
            higher minimum age where required by law. We do not knowingly
            collect personal information from children under the applicable
            minimum age. If we learn that we have collected personal information
            from a child without appropriate consent, we will delete it.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mt-6 mb-2">
            10. Changes to this Privacy Policy
          </h2>
          <p>
            We may update this Privacy Policy from time to time. If we make
            material changes, we will notify you by updating the Effective Date
            and, when appropriate, by providing additional notice within the
            Service. Your continued use of the Service after changes become
            effective means you accept the updated policy.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mt-6 mb-2">11. Contact Us</h2>
          <p>
            If you have any questions or concerns about this Privacy Policy or
            our data practices, please contact us at:
          </p>
          <p className="mt-2">
            Email:{" "}
            <a
              href={`mailto:${CONTACT_EMAIL}`}
              className="text-blue-600 underline"
            >
              {CONTACT_EMAIL}
            </a>
          </p>
        </section>
      </div>
    </main>
  );
}
