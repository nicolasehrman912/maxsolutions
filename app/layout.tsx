import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { CartProvider } from "@/components/cart-provider"
import { ClientProvider } from "@/providers/client-provider"
import Script from "next/script";


const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Max Solutions",
  description: "Max Solutions",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="es">
      <body className={inter.className}>
        <Script
  src="https://www.googletagmanager.com/gtag/js?id=G-NHC34QD1LV"
  strategy="afterInteractive"
/>
<Script id="google-analytics" strategy="afterInteractive">
  {`
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag('js', new Date());
    gtag('config', 'G-NHC34QD1LV', {
      page_path: window.location.pathname,
    });
  `}
</Script>

        <ClientProvider>
          <CartProvider>
            <div className="flex flex-col min-h-screen">
              <Header />
              <main className="flex-1">{children}</main>
              <Footer />
            </div>
          </CartProvider>
        </ClientProvider>
      </body>
    </html>
  )
}



import './globals.css'
