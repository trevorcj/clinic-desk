import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";

const matter = localFont({
  src: [
    {
      path: "./fonts/Matter-Bold.ttf",
      weight: "700",
      style: "normal",
    },
    {
      path: "./fonts/Matter-SemiBold.ttf",
      weight: "600",
      style: "normal",
    },
    {
      path: "./fonts/Matter-Medium.ttf",
      weight: "500",
      style: "normal",
    },
    {
      path: "./fonts/Matter-Regular.ttf",
      weight: "400",
      style: "normal",
    },
    {
      path: "./fonts/Matter-Heavy.ttf",
      weight: "800",
      style: "normal",
    },
  ],
  variable: "--font-matter",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Clinic Desk",
    template: "%s | Clinic Desk",
  },
  description: "Book your next appointment with ease",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${matter.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
