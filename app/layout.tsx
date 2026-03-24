import { Geist, Geist_Mono } from "next/font/google"

import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { ScriptInjector } from "@/components/script-injector"
import { getScripts } from "@/lib/db-scripts"
import { cn } from "@/lib/utils"

const geist = Geist({ subsets: ["latin"], variable: "--font-sans" })

const fontMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
})

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const scripts = getScripts()

  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={cn("antialiased", fontMono.variable, "font-sans", geist.variable)}
    >
      <body>
        {scripts.header_scripts && (
          <ScriptInjector html={scripts.header_scripts} position="head" />
        )}
        <ThemeProvider>{children}</ThemeProvider>
        {scripts.footer_scripts && (
          <ScriptInjector html={scripts.footer_scripts} position="body" />
        )}
      </body>
    </html>
  )
}
