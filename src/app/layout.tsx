import type { Metadata } from "next";
import { Fraunces, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import Navbar from "./components/Navbar";
import FeedbackProvider from "./components/Feedback";

const headingFont = Fraunces({
  variable: "--font-heading",
  subsets: ["latin"],
  weight: ["600", "700"],
});

const bodyFont = Plus_Jakarta_Sans({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
  title: { default: "Jirani", template: "%s · Jirani" },
  description: "Borrow and lend things with your neighbours",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: "try{var t=localStorage.getItem('jirani-theme');if(t)document.documentElement.setAttribute('data-theme',t)}catch(e){}" }} />
      </head>
      <body
        className={`${headingFont.variable} ${bodyFont.variable} antialiased`}
      >
        <a href="#main" className="skip-link">Skip to content</a>
        <FeedbackProvider>
          <Navbar />
          <main id="main">{children}</main>
        </FeedbackProvider>
      </body>
    </html>
  );
}