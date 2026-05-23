import type { Metadata } from "next";
import { Geist_Mono, Poppins } from "next/font/google";
import { AppLoadingScreen } from "@/components/AppLoadingScreen";
import { ThemeProvider } from "@/components/ThemeProvider";
import "./globals.css";

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Juz 30 Quest",
  description: "Game susun ayat Juz 30 untuk anak SD.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="id"
      suppressHydrationWarning
      className={`${poppins.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">
        <ThemeProvider>
          <AppLoadingScreen />
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
