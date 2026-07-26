import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import ConditionalNavbar from "@/components/ConditionalNavbar";
import { Providers } from "./Providers";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Salud Integral - Productos Naturales para tu Bienestar",
  description:
    "Tienda de productos naturales para salud y bienestar. Suplementos, vitaminas, productos orgánicos y más. Envíos a todo el país.",
  keywords: [
    "salud integral",
    "productos naturales",
    "bienestar",
    "suplementos",
    "vitaminas",
    "productos orgánicos",
    "tienda salud",
    "productos naturales Colombia",
    "salud y bienestar",
    "nutrición",
    " productos ecológicos",
    "tienda online salud",
  ],
  openGraph: {
    title: "Salud Integral - Productos Naturales para tu Bienestar",
    description:
      "Tienda de productos naturales para salud y bienestar. Suplementos, vitaminas, productos orgánicos y más.",
    type: "website",
    locale: "es_CO",
    siteName: "Salud Integral",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col" cz-shortcut-listen="true">
        <Providers>
          <ConditionalNavbar />
          {children}
        </Providers>
      </body>
    </html>
  );
}

