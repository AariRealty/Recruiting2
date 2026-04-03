import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Aari Realty | Join Our Team - Real Estate Careers",
  description:
    "Aari Realty positions agents for success with cutting-edge technology, superior training, and flexible commission plans. Start your real estate career with us today.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
