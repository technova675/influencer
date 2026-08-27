import type { Metadata, Viewport } from "next";
import { Fraunces, Inter } from "next/font/google";
import { Reveal } from "@/components/reveal";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

/* Variable serif. WONK/SOFT axes give the display type its character. */
const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  display: "swap",
  axes: ["SOFT", "WONK", "opsz"],
});

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3200",
  ),
  title: {
    default: "Creator Roster — creators, filtered by what a brand needs",
    template: "%s · Creator Roster",
  },
  description:
    "A live roster of creators across every genre, tier and city. Filter by audience, budget and format, and get a shortlist the same day.",
  openGraph: {
    type: "website",
    title: "Creator Roster",
    description:
      "Creators, filtered by what a brand actually needs. Shortlist in minutes.",
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: "#f4f4f2",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${fraunces.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">
        {children}
        <Reveal />
      </body>
    </html>
  );
}
