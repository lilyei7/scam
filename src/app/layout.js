import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "Mujeres con Bienestar - Gobierno del Estado de México",
  description: "Programa de apoyo económico bimestral para mujeres. Regístrate y recibe $3,000 MXN cada dos meses. Registro oficial del gobierno.",
  keywords: "mujeres con bienestar, apoyo económico, gobierno méxico, programa social, registro mujeres, ayuda económica",
  authors: [{ name: "Gobierno del Estado de México" }],
  robots: "index, follow",
  openGraph: {
    title: "Mujeres con Bienestar - Registro Oficial",
    description: "Programa gubernamental de apoyo económico bimestral para mujeres",
    type: "website",
    locale: "es_MX",
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <head>
        <meta charSet="utf-8" />
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased bg-white overflow-x-hidden`}>
        {children}
      </body>
    </html>
  );
}
