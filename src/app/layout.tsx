import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { ToastProvider } from "@/src/components/ToastProvider";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-jetbrains-mono",
});

export const metadata = {
  title: "TMS Pro",
  description: "Customer Ticket Management System",
};

import { AuthProvider } from "@/src/providers/AuthProvider";
import { ReduxProvider } from "@/src/providers/ReduxProvider";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${jetbrainsMono.variable}`}>
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
          rel="stylesheet"
        />
      </head>
      <body suppressHydrationWarning>
        <ReduxProvider>
          <AuthProvider>
            {children}
            <ToastProvider />
          </AuthProvider>
        </ReduxProvider>
      </body>
    </html>
  );
}
