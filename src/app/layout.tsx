import type { Metadata } from "next";
import { Geist_Mono, Lora } from "next/font/google";
import { satoshi } from "@/fonts/satoshi";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import ConditionalLayout from "@/components/ConditionalLayout";
import { QueryProvider } from "@/lib/query-client";
import { Toaster } from "@/components/ui/sonner";

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const lora = Lora({
  variable: "--font-lora",
  subsets: ["latin"],
  style: ["normal", "italic"],
});

export const metadata: Metadata = {
  title: "arian // financial tracker",
  description: "minimal financial transaction tracking",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  const cookie = document.cookie
                    .split("; ")
                    .find((row) => row.startsWith("sidebar_state="));
                  if (cookie) {
                    const isExpanded = cookie.substring("sidebar_state=".length) === "true";
                    if (!isExpanded) {
                      document.documentElement.setAttribute("data-sidebar-collapsed", "true");
                    }
                  }
                } catch (e) {}
              })();
            `,
          }}
        />
      </head>
      <body className={`${satoshi.variable} ${geistMono.variable} ${lora.variable} antialiased`}>
        <QueryProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <ConditionalLayout>{children}</ConditionalLayout>
            <Toaster />
          </ThemeProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
