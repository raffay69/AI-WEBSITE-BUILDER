'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { PlaceholdersAndVanishInput } from '@/components/ui/placeholders-and-vanish-input';
import { SparklesCore } from './ui/sparkles';
import { useAuth } from '@/app/auth/authContext';
import { toast } from 'sonner';

export function PromptInput() {
  const [prompt, setPrompt] = useState('')
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const inputComponentRef = useRef<any>(null)
  const {userLoggedIn}  = useAuth()
  const sparklesRef = useRef<React.ReactNode>(null)

  useEffect(() => {
    if (!sparklesRef.current) {
      sparklesRef.current = (
        <SparklesCore
          background="transparent"
          minSize={0.4}
          maxSize={1}
          particleDensity={1200}
          className="w-full h-full"
          particleColor="#ff4444"
        />
      )
    }
  }, [])

  const placeholders = [
    "Build a responsive landing page.",
    "Create a sleek portfolio website.",
    "Design a modern blog layout.",
    "Generate a pricing page with cards.",
    "Build a dashboard with charts and stats.",
    "Create a product showcase page.",
    "Design a dark mode-friendly UI.",
    "Generate a signup and login form.",
    "Build a navbar with smooth animations.",
    "Create a testimonial section with sliders.",
  ];

  const handleSubmit = async () => {
    if (prompt.trim()) {
      try {
        setLoading(true)
        setError(null)
        const encodedPrompt = encodeURIComponent(prompt.trim())
        
        // Add a small delay to allow the animation to complete
        // before navigating away from the page
        const chatId = generateConversationId()

        setTimeout(() => {
          router.push(`/editor/?chat=${chatId}&prompt=${encodedPrompt}`)
        }, 1000);
      } catch (error:any) {
        setError(error.message)
        console.error('Error:', error)
      } finally {
        setLoading(false)
      }
    }
  }

  function generateConversationId() {
    return Date.now().toString() + '-' + Math.random().toString(36).substring(2, 11);
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPrompt(e.target.value);
  }
  
  const onSubmit = () => {    
    if (userLoggedIn) {
      if (prompt.trim()) {
        handleSubmit();
      } else {
        toast("Please enter a prompt first");
      }
    } else {
      toast("Please Sign In to Continue")
      setTimeout(() => router.push("/signIn"), 1000);
    }
  }

  const handleButtonClick = () => {
    if (inputComponentRef.current) {
      if (prompt.trim()) {
        inputComponentRef.current.vanishAndSubmit();
      } else {
        toast("Please enter a prompt first");
      }
    }
  }

  return (
    <div className="relative group">
      <PlaceholdersAndVanishInput
        ref={inputComponentRef}
        placeholders={placeholders}
        onChange={handleChange} 
        onSubmit={onSubmit}
      />
      <button
        type="button"
        onClick={handleButtonClick}
        className="font-orbitron text-lg font-normal mt-4 w-full bg-customRed text-stone-400 hover:text-white py-2 rounded-lg hover:bg-customRed1 transition-colors"
      >
        Submit
      </button>
      <div className="w-full h-20 relative">
        {/* Fixed sparkle component that doesn't refresh on each keystroke */}
        <div className="absolute left-1/2 -translate-x-1/2 top-0 bg-gradient-to-r from-transparent via-[#ff5555] to-transparent h-[3px] w-3/4 opacity-90" />
        <div className="absolute left-1/2 -translate-x-1/2 top-1 bg-gradient-to-r from-transparent via-[#ff3333]/70 to-transparent h-[1px] w-4/5 blur-[1px]" />
        <div className="absolute left-1/2 -translate-x-1/2 top-0.5 bg-gradient-to-r from-transparent via-[#ff7777]/50 to-transparent h-[5px] w-1/3 blur-[2px]" />
        <div className="absolute left-1/2 -translate-x-1/2 -top-1 bg-gradient-to-r from-transparent via-[#ff4444]/30 to-transparent h-[2px] w-full blur-sm" />

        <div className="absolute inset-0">
          {sparklesRef.current}
        </div>

        {/* Subtle radial gradient */}
        <div className="absolute inset-0 w-full h-full bg-black [mask-image:radial-gradient(450px_300px_at_top,transparent_10%,white)]" />
      </div>
    </div>
  )
}