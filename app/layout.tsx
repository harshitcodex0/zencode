import type { Metadata } from "next";
import { Geist, Geist_Mono, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import { ClerkProvider, Show, SignInButton, SignUpButton, UserButton } from '@clerk/nextjs'
// import {ThemeProvider} from "next-themes";
import {ThemeProvider} from "@/providers/theme-providers";
import {Toaster} from "@/components/ui/sonner";
import { AIAssistant } from '@/components/ai-assistant';

const jetbrainsMono = JetBrains_Mono({subsets:['latin'],variable:'--font-mono'});

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "ZenCode",
  description: "Master Coding Through Understanding - A modern platform to practice and learn algorithms.",
  icons: {
    icon: "/ex1logo.png"
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en" suppressHydrationWarning
      className={cn("h-full", "antialiased", geistSans.variable, geistMono.variable, "font-mono", jetbrainsMono.variable)}
    >
      <body className="min-h-full flex flex-col">
      <ClerkProvider>
        <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
        >
          <Toaster/>
          {children}
          <AIAssistant />
        </ThemeProvider>
        
      </ClerkProvider>
      </body>
    </html>
  );
}
