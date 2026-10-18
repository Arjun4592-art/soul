import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Preeti Soulpreneur: Where spirit meets success",
    template: "%s | Preeti Soulpreneur",
  },
  description:
    "Coaching, courses and a free morning community for people who are tired of carrying everything alone. From overwhelm to inner peace, with Preeti Yadav.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        {/* eslint-disable-next-line @next/next/no-page-custom-font -- root layout, applies to every page */}
        <link
          href="https://fonts.googleapis.com/css2?family=DM+Mono:wght@400;500&family=Karla:ital,wght@0,400;0,500;0,700;1,400&family=Young+Serif&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="flex min-h-full flex-col bg-paper font-body text-ink antialiased">{children}</body>
    </html>
  );
}
