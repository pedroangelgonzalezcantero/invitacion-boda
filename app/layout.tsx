import type { Metadata, Viewport } from "next";
import "./globals.css";

const bride = process.env.NEXT_PUBLIC_BRIDE_NAME || "Sofía";
const groom = process.env.NEXT_PUBLIC_GROOM_NAME || "Alejandro";

export const metadata: Metadata = {
  title: `${bride} & ${groom} — Nuestra Boda`,
  description: `Únete a nosotros para celebrar el matrimonio de ${bride} y ${groom}. Reserva tu lugar en este día tan especial.`,
  icons: {
    icon: "/images/sello.png",
    apple: "/images/sello.png",
  },
  openGraph: {
    title: `${bride} & ${groom} — Nuestra Boda`,
    description: `Estás invitado a nuestra boda. Confirma tu asistencia.`,
    type: "website",
  },
  robots: "noindex, nofollow",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;1,300;1,400;1,500&family=Montserrat:wght@300;400;500&display=swap"
          rel="stylesheet"
        />
      </head>
      <body style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}>
        {children}
      </body>
    </html>
  );
}
