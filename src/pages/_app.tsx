import '../styles/globals.css';
import type { AppProps } from 'next/app';
import Head from "next/head";
import { ThemeProvider } from "next-themes";
import { Navbar } from '../components/layout/Navbar';

function MyApp({ Component, pageProps }: AppProps) {
    return (
        <ThemeProvider attribute="class">
            <Head>
                <title>hangout</title>
            </Head>
            <div>
                <Navbar />
                <Component {...pageProps} />
            </div>
        </ThemeProvider>
    );
}

export default MyApp;