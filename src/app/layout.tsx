import type { Metadata } from "next";
import "./globals.css";
import AuthProvider from "@/components/AuthProvider";

export const metadata: Metadata = {
  title: "Undangan Digital - Buat Undangan Pernikahan Digital Premium",
  description:
    "Buat undangan pernikahan digital yang elegan dan modern. Dilengkapi RSVP, amplop digital, galeri foto, musik, dan banyak fitur premium lainnya.",
  keywords: [
    "undangan digital",
    "undangan pernikahan online",
    "wedding invitation",
    "undangan nikah",
    "e-invitation",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <body>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
