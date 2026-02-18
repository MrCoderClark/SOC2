import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SOC 2 Compliance Platform",
  description: "AI-powered SOC 2 compliance automation",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
