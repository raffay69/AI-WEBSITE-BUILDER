import './globals.css'
import { Inter } from 'next/font/google'
import { ProjectProvider } from './projectContext'
import { AuthProvider } from './auth/authContext'
import { Toaster } from '@/components/ui/sonner'

const inter = Inter({ subsets: ['latin'] })


export const metadata = {
  title: 'PHANTOM',
  description: 'Build full-stack web apps with AI',
  icons :"/phantom-mascot-logo_71220-38-removebg-preview.png"
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} min-h-screen bg-black text-white flex flex-col`}>
      <AuthProvider>
        <ProjectProvider>
        {children}
        <Toaster />
        </ProjectProvider>
      </AuthProvider>
      </body>
    </html>
  )
}

