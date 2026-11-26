import { Inter, JetBrains_Mono, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { ToastProvider } from "@/src/components/ToastProvider";
import { AuthProvider } from "@/src/providers/AuthProvider";
import { ReduxProvider } from "@/src/providers/ReduxProvider";
import { NotificationProvider } from "@/src/providers/NotificationProvider";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-plus-jakarta",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-jetbrains-mono",
});

export const metadata = {
  title: "TMS Pro — Customer Help Center & Support",
  description: "Self-service help center, support requests, and ticket tracking portal.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${plusJakarta.variable} ${jetbrainsMono.variable}`}
    >
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
          rel="stylesheet"
        />
      </head>
      <body suppressHydrationWarning>
        <ReduxProvider>
          <AuthProvider>
            <NotificationProvider>
              {children}
              <ToastProvider />
            </NotificationProvider>
          </AuthProvider>
        </ReduxProvider>
      </body>
    </html>
  );
}
