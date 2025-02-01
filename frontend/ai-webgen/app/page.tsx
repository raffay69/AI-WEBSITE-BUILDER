/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';

import { Logo } from '@/components/logo'
import { PromptInput } from '@/components/prompt-input'
import { TypewriterEffectSmoothDemo } from '@/components/typewriter';
import { useRouter } from 'next/navigation';



export default function Home() {
  const router = useRouter();

  const handleLogoClick = () => {
    router.push('/'); // Navigate to the homepage
  };

  return (
    <main className="flex-1 flex flex-col">
      <div className="p-6">      
          <Logo />
      </div>
      <div className="flex-1 flex flex-col items-center justify-center px-4 -mt-16">
        <h1 className="text-4xl  mb-2 text-center font-orbitron  font-normal">
          What do you want to build?
        </h1>
        <p className=" text-gray-400 mb-8 font-orbitron text-lg font-normal">
          Prompt and run full-stack web apps.
        </p>
        <div className="w-full max-w-3xl">
          <PromptInput />
          <TypewriterEffectSmoothDemo/>
        </div>
      </div>
    </main>
  )
}

