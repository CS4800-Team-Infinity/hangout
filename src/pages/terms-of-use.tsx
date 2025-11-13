import React from "react";

const APP_NAME = "HangOut";
const SITE_URL = "https://gethangout.app";
const LAST_UPDATED = "November 13, 2025";
const CONTACT_EMAIL = "gethangout.team@gmail.com";
const GOVERNING_LAW = "the State of California, USA";

export default function TermsOfUse() {
  return (
    <main className="w-full flex justify-center ">
      <div className="max-w-5xl w-full px-4 py-30 text-black text-sm">
        <h1 className="text-3xl font-bold mb-4">Terms of Use</h1>
        <div className="w-full h-0.5 bg-gray-300 mt-2 mb-6"></div>
        <p className="text-sm text-gray-600">Last Updated: {LAST_UPDATED}</p>

        <section>
          <h2 className="text-xl font-semibold mt-6 mb-2">
            1. Acceptance of Terms
          </h2>
          <p>
            By accessing or using the Service at{" "}
            <a
              href={SITE_URL}
              className="text-blue-600 underline"
              target="_blank"
              rel="noreferrer"
            >
              {SITE_URL}
            </a>
            , you agree to be bound by these Terms of Use (the "Terms") and our
            Privacy Policy. If you do not agree to these Terms, you should not
            use the Service.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mt-6 mb-2">
            2. Changes to These Terms
          </h2>
          <p>
            We may modify these Terms from time to time. If we do, we will
            update the Effective Date at the top of this page and may provide
            additional notice within the Service. Your continued use of the
            Service after the updated Terms become effective means you accept
            the changes.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mt-6 mb-2">3. Eligibility</h2>
          <p>
            You must be at least 13 years old, or the minimum age in your
            jurisdiction if higher, to use the Service. If you are under the age
            of majority in your jurisdiction, you may use the Service only with
            the consent of a parent or legal guardian. By using the Service, you
            represent and warrant that you meet these requirements.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mt-6 mb-2">4. Accounts</h2>
          <ul className="list-disc list-inside space-y-1">
            <li>
              You may need to create an account to access certain features of
              the Service.
            </li>
            <li>
              You agree to provide accurate and complete information and to keep
              your account information up to date.
            </li>
            <li>
              You are responsible for maintaining the confidentiality of your
              login credentials and for all activities that occur under your
              account.
            </li>
            <li>
              You agree to notify us promptly of any unauthorized use of your
              account or any other security breach.
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold mt-6 mb-2">
            5. Acceptable Use and Prohibited Conduct
          </h2>
          <p>When using the Service, you agree that you will not:</p>
          <ul className="list-disc list-inside space-y-1 mt-2">
            <li>Violate any applicable law or regulation.</li>
            <li>
              Infringe, misappropriate, or violate the rights of others,
              including privacy, publicity, and intellectual property rights.
            </li>
            <li>
              Upload, share, or post any content that is unlawful, harmful,
              deceptive, fraudulent, defamatory, obscene, hateful, harassing,
              violent, or otherwise objectionable.
            </li>
            <li>
              Impersonate any person or entity or misrepresent your affiliation
              with any person or entity.
            </li>
            <li>
              Use the Service for any commercial purpose that is not expressly
              permitted by us.
            </li>
            <li>
              Interfere with or disrupt the operation of the Service or any
              servers or networks used to make the Service available.
            </li>
            <li>
              Attempt to probe, scan, or test the vulnerability of any system or
              network or breach security or authentication measures.
            </li>
            <li>
              Attempt to reverse engineer, decompile, or disassemble any part of
              the Service or create derivative works based on the Service,
              except where such restrictions are not allowed by law.
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold mt-6 mb-2">
            6. Events, Content, and Interactions
          </h2>
          <ul className="list-disc list-inside space-y-1">
            <li>
              When you create, host, or join events through the Service, you are
              responsible for complying with any applicable laws and regulations
              and for setting and communicating any rules or requirements that
              apply to your events.
            </li>
            <li>
              We do not control or endorse any events or user generated content
              and are not responsible for the safety, quality, legality, or
              accuracy of events or content provided by users.
            </li>
            <li>
              Your interactions with other users, both online and offline, are
              solely your responsibility. You should exercise judgment and care
              in all interactions, particularly when meeting in person.
            </li>
            <li>
              We reserve the right, but have no obligation, to monitor, review,
              remove, or disable access to any content or event that we consider
              to violate these Terms or to be harmful in any way.
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold mt-6 mb-2">
            7. Your Content and License Grant
          </h2>
          <p>
            You may upload, post, or otherwise share content through the
            Service, including event descriptions, photos, messages, and other
            materials (collectively, "User Content").
          </p>
          <ul className="list-disc list-inside space-y-1 mt-2">
            <li>
              You retain ownership of your User Content. You are responsible for
              the User Content you share and you represent and warrant that you
              have all rights necessary to share it.
            </li>
            <li>
              By submitting User Content, you grant us a non exclusive,
              worldwide, royalty free, transferable, and sublicensable license
              to use, host, store, reproduce, modify, adapt, publish, translate,
              distribute, display, and perform your User Content in connection
              with operating, promoting, and improving the Service.
            </li>
            <li>
              You also grant other users a limited license to access and use
              your User Content as permitted by the functionality of the Service
              and these Terms.
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold mt-6 mb-2">
            8. Ownership of the Service
          </h2>
          <p>
            The Service, including all content, features, and functionality such
            as software, designs, text, graphics, logos, and trademarks, is
            owned by us or our licensors and is protected by intellectual
            property laws. Except for the limited rights expressly granted to
            you in these Terms, you do not acquire any rights in or to the
            Service or its content.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mt-6 mb-2">9. Disclaimers</h2>
          <p>
            The Service is provided on an "as is" and "as available" basis,
            without warranties of any kind, whether express or implied. To the
            fullest extent allowed by law, we disclaim all warranties, including
            implied warranties of merchantability, fitness for a particular
            purpose, and non infringement.
          </p>
          <p className="mt-2">
            We do not warrant that the Service will be uninterrupted, secure, or
            free of errors, that defects will be corrected, or that the Service
            or the servers that make it available are free of harmful
            components.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mt-6 mb-2">
            10. Limitation of Liability
          </h2>
          <p>
            To the fullest extent permitted by law, we will not be liable for
            any indirect, incidental, special, consequential, or punitive
            damages, or for any loss of profits, revenue, data, or goodwill,
            arising out of or in connection with your use of or inability to use
            the Service, even if we have been advised of the possibility of such
            damages.
          </p>
          <p className="mt-2">
            Our total liability for any claim arising out of or relating to
            these Terms or the Service will not exceed the amount you have paid
            to us for use of the Service in the twelve months before the event
            giving rise to the claim, or, if greater, one hundred United States
            dollars.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mt-6 mb-2">
            11. Indemnification
          </h2>
          <p>
            You agree to indemnify, defend, and hold harmless us and our
            affiliates, officers, directors, employees, and agents from and
            against any claims, liabilities, damages, losses, and expenses,
            including reasonable legal and accounting fees, arising out of or in
            any way connected with your use of the Service or your violation of
            these Terms.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mt-6 mb-2">12. Termination</h2>
          <p>
            We may suspend or terminate your access to the Service at any time,
            for any reason or no reason, including if we believe that you have
            violated these Terms. Upon termination, your right to use the
            Service will immediately cease. Sections of these Terms that by
            their nature should survive termination will continue in effect,
            including ownership provisions, disclaimers, limitations of
            liability, and indemnification obligations.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mt-6 mb-2">
            13. Governing Law and Dispute Resolution
          </h2>
          <p>
            These Terms and any dispute or claim arising out of or relating to
            them or the Service are governed by the laws of {GOVERNING_LAW},
            without regard to conflict of law principles.
          </p>
          <p className="mt-2">
            Any legal action or proceeding arising under or relating to these
            Terms will be brought exclusively in the courts located in
            California, unless applicable law requires a different venue. You
            consent to the personal jurisdiction and venue of these courts.
          </p>
          {/* If you plan to use arbitration instead of courts, update this section accordingly */}
        </section>

        <section>
          <h2 className="text-xl font-semibold mt-6 mb-2">
            14. Changes to the Service
          </h2>
          <p>
            We may change, suspend, or discontinue all or part of the Service at
            any time, with or without notice. We will not be liable to you or
            any third party for any modification, suspension, or discontinuation
            of the Service.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mt-6 mb-2">
            15. Entire Agreement
          </h2>
          <p>
            These Terms, together with our Privacy Policy and any other policies
            or guidelines referenced in them, constitute the entire agreement
            between you and us regarding the Service and supersede all prior or
            contemporaneous agreements related to the Service.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mt-6 mb-2">16. Contact Us</h2>
          <p>
            If you have any questions about these Terms, please contact us at:
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
