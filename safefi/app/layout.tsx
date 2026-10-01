import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import { Analytics } from "@/components/Analytics";
import { COMPANY_NAME, SEO, SITE_NAME, SITE_URL } from "@/lib/site";
import "./globals.css";

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
  variable: "--font-jakarta",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: SEO.title,
  description: SEO.description,
  applicationName: SITE_NAME,
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    siteName: SITE_NAME,
    title: SEO.title,
    description: SEO.description,
    url: "/",
    locale: "en_MY",
  },
  twitter: { card: "summary_large_image", title: SEO.title, description: SEO.description },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: "#07050F",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

/**
 * Runs before first paint and picks the journey layout, so the right one is on
 * screen from the first frame (no flash, no layout shift):
 *   cinematic → pinned 3D canvas with overlay cards
 *   flow      → readable story with still images (reduced motion, no WebGL)
 * QA overrides: ?mode=flow | ?mode=cinematic | ?mode=nowebgl
 */
const MODE_SCRIPT = `(function(){try{var d=document.documentElement,q=new URLSearchParams(location.search).get('mode'),m;
if(q==='flow'||q==='reduced'||q==='nowebgl')m='flow';else if(q==='cinematic')m='cinematic';
else m=(matchMedia('(prefers-reduced-motion: reduce)').matches||!window.WebGLRenderingContext)?'flow':'cinematic';
d.setAttribute('data-journey',m);}catch(e){}})();`;

const orgJsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": `${SITE_URL}/#org`,
      name: COMPANY_NAME,
      url: SITE_URL,
      logo: `${SITE_URL}/icon.svg`,
      brand: { "@type": "Brand", name: SITE_NAME },
      areaServed: "MY",
    },
    {
      "@type": "WebSite",
      "@id": `${SITE_URL}/#website`,
      url: SITE_URL,
      name: SITE_NAME,
      publisher: { "@id": `${SITE_URL}/#org` },
      inLanguage: "en-MY",
    },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={jakarta.variable} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: MODE_SCRIPT }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(orgJsonLd) }} />
      </head>
      <body className="font-sans">
        {children}
        <Analytics />
      </body>
    </html>
  );
}
