import { Inter } from "next/font/google";
import "./globals.css";
import Providers from "@/components/Providers";
import { cn, constructMetadata } from "@/lib/utils";
import { Toaster } from "@/components/ui/sonner";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import WrapperMaxWidth from "@/components/WrapperMaxWidth";

const inter = Inter({ subsets: ["latin"] });

export const metadata = constructMetadata();

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full">
      <body
        className={cn("font-sans antialiased bg-gray-100", inter.className)}
      >
        <Providers>
          <Navbar />
          <main className="min-h-screen mt-12">
            <WrapperMaxWidth>{children}</WrapperMaxWidth>
          </main>
          <Footer />
          <Toaster />
        </Providers>
      </body>
    </html>
  );
}
