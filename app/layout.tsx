import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"

import { ThemeScript } from "@/components/theme-script"
import { ReactQueryProvider } from "@/lib/react-query-provider"
import { ThemeProvider } from "@/lib/theme-provider"
import "./globals.css"

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
})

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
})

export const metadata: Metadata = {
  title: "Rental Management App",
  description:
    "Comprehensive rental property management system for tracking units, income, expenses, and documents",
  icons: {
    icon: "/icon.svg",
    apple: "/apple-icon.svg",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <ThemeScript />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <ReactQueryProvider>{children}</ReactQueryProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
