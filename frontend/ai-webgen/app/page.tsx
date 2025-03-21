'use client';

import { Logo } from '@/components/logo'
import { PromptInput } from '@/components/prompt-input'
import { BackgroundGradient } from '@/components/ui/background-gradient';
import { Github } from 'lucide-react';
import Link from "next/link"
import { WavyBackground } from '@/components/ui/wavy-background';
import AuthButtons from '@/components/ui/auth-buttons';
import { useEffect, useState } from 'react';
import { useAuth } from './auth/authContext';
import { ClaudeSidebar } from '@/components/ui/sidebar';

export default function Home() {
const [isSideBarOpen , setIsSideBarOpen] = useState(false)
const {userLoggedIn} = useAuth()

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
  
  
      // Open sidebar when mouse is within 20px of the left edge
      if (e.clientX <= 20 && !isSideBarOpen) {
        setIsSideBarOpen(true)
      }
  
      // Close sidebar when mouse is far from the sidebar (when sidebar is open)
      if (e.clientX > 300 && isSideBarOpen) {
        setIsSideBarOpen(false)
      }
    }
  
    window.addEventListener("mousemove", handleMouseMove)
    return () => window.removeEventListener("mousemove", handleMouseMove)
  }, [isSideBarOpen])

  

  return ( 
    <WavyBackground 
      backgroundFill="rgba(0,0,0,0.85)"
      waveOpacity={0.4}
      blur={8}
      containerClassName="min-h-screen w-full"
      className="w-full"
    >
      <main className="flex-1 flex flex-col h-screen">
        {userLoggedIn && <ClaudeSidebar isOpen={isSideBarOpen} setIsOpen={setIsSideBarOpen} />}
        <div className="p-6 ">      
          <Logo/>
        </div>
        <div className="flex justify-center absolute right-5 top-8 ">
          <AuthButtons />
        </div>
        <div className="flex-1 flex flex-col items-center justify-center px-4 -mt-16">
          <h1 className="text-4xl mb-2 text-center font-orbitron font-normal">
            What do you want to build?
          </h1>
          <p className="text-gray-400 mb-8 font-orbitron text-lg font-normal">
            Prompt and run full-stack web apps.
          </p>
          <div className="w-full max-w-3xl">
            <PromptInput />
          </div>
        </div>
        <div className="fixed bottom-4 right-4 w-auto max-w-[250px] z-10">
          <BackgroundGradient className="relative rounded-3xl p-4 bg-black/95 hover:bg-black transition-all duration-300 border border-red-700/30 hover:border-red-600/40">
            {/* Main glow layer */}
            <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-red-700/15 to-transparent blur-[12px] -z-10" />
            
            {/* Content container */}
            <div className="flex items-center gap-3">
              <div className="flex-1 min-w-0">
                <p className="text-xs text-red-300/90 truncate">
                  Created by
                </p>
                <p className="font-medium text-sm truncate text-white">
                  Mohammed abdul raffay
                </p>
              </div>

              <Link
                href="https://github.com/raffay69/AI-WEBSITE-BUILDER"
                target="_blank"
                className="text-red-400 hover:text-red-300 transition-colors duration-200"
              >
                <Github className="h-5 w-5" />
                <span className="sr-only">GitHub Profile</span>
              </Link>
            </div>

            {/* Thin bottom accent glow */}
            <div className="absolute inset-x-0 -bottom-2 h-4 bg-red-600/30 blur-[10px] -z-20" />
          </BackgroundGradient>
        </div>
      </main>
    </WavyBackground> 
  )
}