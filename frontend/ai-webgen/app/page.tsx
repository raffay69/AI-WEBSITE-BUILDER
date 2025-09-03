"use client";

import { Logo } from "@/components/logo";
import { PromptInput } from "@/components/prompt-input";
import { BackgroundGradient } from "@/components/ui/background-gradient";
import { Github } from "lucide-react";
import Link from "next/link";
import { WavyBackground } from "@/components/ui/wavy-background";
import AuthButtons from "@/components/ui/auth-buttons";
import { useEffect, useState } from "react";
import { useAuth } from "./auth/authContext";
import { ClaudeSidebar } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/moving-border";

export default function Home() {
  const [isSideBarOpen, setIsSideBarOpen] = useState(false);
  const { userLoggedIn, currentUser } = useAuth();

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      // Open sidebar when mouse is within 20px of the left edge
      if (e.clientX <= 45 && !isSideBarOpen) {
        setIsSideBarOpen(true);
      }

      // Close sidebar when mouse is far from the sidebar (when sidebar is open)
      if (e.clientX > 300 && isSideBarOpen) {
        setIsSideBarOpen(false);
      }
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [isSideBarOpen]);

  return (
    <WavyBackground
      colors={[
        "#b91c1c", // red-700
        "#991b1b", // red-800
        "#7f1d1d", // red-900
        "#a31d1d", // dark red
        "#880808",
      ]}
      backgroundFill="rgba(0,0,0,0.85)"
      waveOpacity={0.4}
      blur={8}
      containerClassName="min-h-screen w-full"
      className="w-full"
    >
      <main className="flex-1 flex flex-col h-screen">
        {userLoggedIn && (
          <ClaudeSidebar
            isOpen={isSideBarOpen}
            setIsOpen={setIsSideBarOpen}
            color="red"
          />
        )}
        <div className="flex justify-between p-6 ">
          <Logo />
          {/* add if servers are down */}
          {/* <Button
              color='#FF0000'
              borderRadius="1.75rem"
              className="bg-black p-4 dark:bg-black text-black dark:text-white border-neutral-200 dark:border-slate-800">
              🙏 Our servers are down due to usage limits. Service will resume at the start of next month
          </Button> */}
          {/* add if servers are down */}
          <div className="w-[200px]"></div>
        </div>
        <div className="flex justify-center absolute right-5 top-8 ">
          <AuthButtons color="#FF0000" />
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
                <p className="text-xs text-red-300/90 truncate">Created by</p>
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
        {userLoggedIn && currentUser?.displayName && (
          <div className="fixed bottom-4 left-4 h-8 w-8 rounded-full bg-red-700 flex items-center justify-center text-white font-semibold z-10">
            {currentUser.displayName.charAt(0)}
          </div>
        )}
        <div className="flex justify-center mb-4">
          <Button
            color="#8A2BE2"
            borderRadius="1.75rem"
            className="bg-black p-4 dark:bg-black text-black dark:text-white border-neutral-200 dark:border-slate-800"
          >
            Want to build mobile apps effortlessly? Check out
            <a
              href="https://phantom-ai-raffay.vercel.app/mobile"
              className="hover:opacity-80"
            >
              <span className="font-orbitron text-sm font-bold text-[#8A2BE2] ml-1 tracking-wider">
                PHANTOM
              </span>
              <span className="font-orbitron text-xs text-[#B98DF0] ml-1 mt-1">
                mobile
              </span>
              .
            </a>
          </Button>
        </div>
      </main>
    </WavyBackground>
  );
}
