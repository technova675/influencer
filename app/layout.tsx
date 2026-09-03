import type { Metadata, Viewport } from "next";
import { IBM_Plex_Mono, Inter, Space_Grotesk } from "next/font/google";
import { Reveal } from "@/components/reveal";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

/* The display face. Grotesk rather than serif: the site argues that talent is
   a media line item, and the headlines have to sound like the ticker under
   them rather than like an editorial. */
const grotesk = Space_Grotesk({
  variable: "--font-grotesk",
  subsets: ["latin"],
  display: "swap",
  weight: ["500", "600", "700"],
});

/* Every measured thing on the site is set in this - rates, reach, engagement,
   column headers, buttons. Mono is what makes a column of figures comparable. */
const plexMono = IBM_Plex_Mono({
  variable: "--font-plex-mono",
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500"],
});

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3200",
  ),
  title: {
    default: "Adbibe — influencers, creators and models, already sorted",
    template: "%s · Adbibe",
  },
  description:
    "A live roster of creators across every genre, tier and city. Filter by audience, budget and format, and get a shortlist the same day.",
  openGraph: {
    type: "website",
    title: "Adbibe",
    description:
      "Influencers, creators and models, filtered by what you actually need. Shortlist in minutes.",
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: "#f1f2ed",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${grotesk.variable} ${plexMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">
        {children}
        <Reveal />
      </body>
    </html>
  );
}
