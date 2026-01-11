import type { Metadata } from "next";
import "./globals.css";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
    title: "Cearnógach - Cluiche Focail Gaeilge",
    description: "Cluiche cuardaigh focail as Gaeilge",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="ga"
            className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
            <body>
                {children}
                <Footer />
            </body>
        </html>
    );
}
