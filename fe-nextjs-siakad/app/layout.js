'use client';

import Script from "next/script";
import { LayoutProvider } from '../layout/context/layoutcontext';
import { PrimeReactProvider } from 'primereact/api';
import 'primereact/resources/primereact.css';
import 'primeflex/primeflex.css';
import 'primeicons/primeicons.css';
import '../styles/layout/layout.scss';
import '../styles/demo/Demos.scss';

export default function RootLayout({ children }) {
    return (
        <html lang="en" suppressHydrationWarning>
            <head>
                <link
                    id="theme-css"
                    href={`/themes/lara-light-indigo/theme.css`}
                    rel="stylesheet"
                />
            </head>
            <body>
                {/* ✅ MIDTRANS SNAP SCRIPT – PASANG DI SINI */}
                <Script
                    src="https://app.sandbox.midtrans.com/snap/snap.js"
                    data-client-key={process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY}
                    strategy="afterInteractive"
                />

                <PrimeReactProvider>
                    <LayoutProvider>
                        {children}
                    </LayoutProvider>
                </PrimeReactProvider>
            </body>
        </html>
    );
}
