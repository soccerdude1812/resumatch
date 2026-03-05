import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains",
  display: "swap",
});

export const metadata: Metadata = {
  title: "ResuMatch — AI Resume Tailor",
  description:
    "Paste your resume and a job description. Get an ATS-optimized, tailored resume in seconds. Free AI-powered resume matching and rewriting.",
  keywords: [
    "resume",
    "ATS",
    "job application",
    "AI resume",
    "resume tailor",
    "resume optimizer",
  ],
  openGraph: {
    title: "ResuMatch — AI Resume Tailor",
    description:
      "Paste your resume and a job description. Get an ATS-optimized, tailored resume in seconds.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${inter.variable} ${jetbrainsMono.variable} font-sans antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
