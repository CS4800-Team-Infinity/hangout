import '../styles/globals.css';
import type { AppProps } from 'next/app';
import Head from "next/head";
import { ThemeProvider } from "next-themes";
import { Navbar } from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import { AuthProvider } from '../contexts/AuthContext';
import Script from 'next/script';
import { useEffect } from 'react';

function MyApp({ Component, pageProps }: AppProps) {
  useEffect(() => {
    // Create translate container dynamically
    const existing = document.getElementById("google_translate_element");
    if (!existing) {
      const div = document.createElement("div");
      div.id = "google_translate_element";
      document.body.appendChild(div);
    }
  }, []);

  return (
    <ThemeProvider attribute="class">
      <AuthProvider>
        <Head>
          <title>hangout</title>
        </Head>

        {/* Google Translate Scripts */}
        <Script
          id="google-translate-init"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              function googleTranslateElementInit() {
                new google.translate.TranslateElement({
                  pageLanguage: 'en',
                  layout: google.translate.TranslateElement.InlineLayout.HORIZONTAL
                }, 'google_translate_element');
              }
            `,
          }}
        />

        <Script
          src="//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit"
          strategy="afterInteractive"
        />

        <div className="flex flex-col min-h-screen">
          <Navbar />
          <main className="flex-grow">
            <Component {...pageProps} />
          </main>
          <Footer />
        </div>      
      </AuthProvider>
    </ThemeProvider>
  );
}

export default MyApp;
