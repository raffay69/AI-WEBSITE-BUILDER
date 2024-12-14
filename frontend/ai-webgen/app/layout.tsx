import './globals.css'
import { Inter } from 'next/font/google'
import { ProjectProvider } from './projectContext'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'AI WEBSITE GENERATOR',
  description: 'Build full-stack web apps with AI',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} min-h-screen bg-black text-white flex flex-col`}>
        <ProjectProvider>
        {children}
        </ProjectProvider>
      </body>
    </html>
  )
}

