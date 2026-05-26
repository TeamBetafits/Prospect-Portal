import React from 'react';
import AuthProvider from '@/components/AuthProvider';
import ConditionalLayout from '@/components/ConditionalLayout';
import './globals.css';

export const metadata = {
    title: 'Betafits Portal',
    description: 'Manage your intake workflow and document submissions',
    icons: {
        icon: '/favicon.ico',
        shortcut: '/favicon.ico',
        apple: '/favicon.ico',
    },
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en">
            <body className="bg-gray-50">
                <AuthProvider>
                    <ConditionalLayout>{children}</ConditionalLayout>
                </AuthProvider>
            </body>
        </html>
    );
}


