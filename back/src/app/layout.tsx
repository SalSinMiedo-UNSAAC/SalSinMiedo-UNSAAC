import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Sal Sin Miedo API",
  description: "Backend service for Sal Sin Miedo",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
