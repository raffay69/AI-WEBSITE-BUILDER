'use client';

import { Logo, Logo2 } from '@/components/logo'
import { PromptInput, PromptInput2 } from '@/components/prompt-input'
import { BackgroundGradient } from '@/components/ui/background-gradient';
import { Github } from 'lucide-react';
import Link from "next/link"
import { WavyBackground } from '@/components/ui/wavy-background';
import AuthButtons from '@/components/ui/auth-buttons';
import { useEffect, useState } from 'react';
import { ClaudeSidebar } from '@/components/ui/sidebar';
import { useAuth } from '../auth/authContext';
import { Button } from '@/components/ui/moving-border';

export default function Home() {
const [isSideBarOpen , setIsSideBarOpen] = useState(false)
const {userLoggedIn ,currentUser} = useAuth()

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
  
  
      // Open sidebar when mouse is within 20px of the left edge
      if (e.clientX <= 45 && !isSideBarOpen) {
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
    <WavyBackground //rgba(0,0,0,0.85)
      backgroundFill="rgba(0,0,0,0.85)"
      waveOpacity={0.4}
      colors={[
      "#6a0dad", // Royal Purple
      "#5a189a", // Vivid Deep Violet
      "#4b0082", // Indigo
      "#3a0ca3", // Dark Violet-Blue
      "#3f1f66", // Deep Purple
      ]}
      blur={8}
      containerClassName="min-h-screen w-full"
      className="w-full"
    >
      <main className="flex-1 flex flex-col h-screen">
        {userLoggedIn && <ClaudeSidebar isOpen={isSideBarOpen} setIsOpen={setIsSideBarOpen} color='#8A2BE2'/>}
        <div className="p-6 ">      
          <Logo2/>
        </div>
        <div className="flex justify-center absolute right-5 top-8 ">
          <AuthButtons color='#8A2BE2' />
        </div>
        <div className="flex-1 flex flex-col items-center justify-center px-4 -mt-16">
          <h1 className="text-4xl mb-2 text-center font-orbitron font-normal">
            What do you want to build?
          </h1>
          <p className="text-gray-400 mb-8 font-orbitron text-lg font-normal">
            Prompt and run mobile apps.
          </p>
          <div className="w-full max-w-3xl">
            <PromptInput2 />
          </div>
        </div>
        <div className="fixed bottom-4 right-4 w-auto max-w-[250px] z-10">
          <BackgroundGradient colorTheme='purple' className="relative rounded-3xl p-4 bg-black/95 hover:bg-black transition-all duration-300 border border-[#8A2BE2]/30 hover:border-[#8A2BE2]/40">
            {/* Main glow layer */}
            <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-[#8A2BE2]/15 to-transparent blur-[12px] -z-10" />
            
            {/* Content container */}
            <div className="flex items-center gap-3">
              <div className="flex-1 min-w-0">
                <p className="text-xs text-[#B98DF0]/90 truncate">
                  Created by
                </p>
                <p className="font-medium text-sm truncate text-white">
                  Mohammed abdul raffay
                </p>
              </div>

              <Link
                href="https://github.com/raffay69/AI-WEBSITE-BUILDER"
                target="_blank"
                className="text-[#B98DF0] hover:text-[#D0B6F6] transition-colors duration-200"
              >
                <Github className="h-5 w-5" />
                <span className="sr-only">GitHub Profile</span>
              </Link>
            </div>
            
            {/* Thin bottom accent glow */}
            <div className="absolute inset-x-0 -bottom-2 h-4 bg-[#8A2BE2]/30 blur-[10px] -z-20" />
          </BackgroundGradient>
        </div>
        {userLoggedIn && currentUser?.displayName && (
          <div className="fixed bottom-4 left-4 h-8 w-8 rounded-full bg-[#8A2BE2] flex items-center justify-center text-black font-semibold z-10">
            {currentUser.displayName.charAt(0)}
          </div>
        )}
        <div className='flex justify-center mb-4'>
          <Button
              color='#FF0000'
              borderRadius="1.75rem"
              className="bg-black p-4 dark:bg-black text-black dark:text-white border-neutral-200 dark:border-slate-800">
              Want to generate web apps in minutes? Explore
              <a href="http://localhost:3000" className='hover:opacity-80'> 
              <span className="font-orbitron text-sm font-bold text-red-600 ml-1 tracking-wider">
              PHANTOM
              </span>
              </a>
          </Button>
        </div>
      </main>
    </WavyBackground> 
  )
}