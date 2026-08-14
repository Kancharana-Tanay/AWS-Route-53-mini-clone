import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Toaster } from "sonner";
import { AuthProvider } from "@/lib/auth-context";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "AWS Route 53 Management Console",
  description:
    "Amazon Route 53 is a highly available and scalable cloud Domain Name System (DNS) web service.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} antialiased bg-[#f2f3f3] text-[#16191f]`}>
        <AuthProvider>
          {children}
          <Toaster
            position="top-right"
            richColors
            closeButton
            toastOptions={{
              style: {
                borderRadius: "2px",
                fontSize: "12px",
                fontFamily: "inherit",
              },
            }}
          />
        </AuthProvider>
      </body>
    </html>
  );
}
