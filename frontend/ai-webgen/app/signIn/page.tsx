"use client";

import React, { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import 'typeface-orbitron';
import { WavyBackground } from "@/components/ui/wavy-background";
import { useAuth } from "../auth/authContext";
import { doSignInWithEmailAndPassword, doSignInWithGitHub, doSignInWithGoogle } from "../auth/auth";
import { useRouter } from "next/navigation"; // Changed from next/navigation
import { toast } from "sonner";
import { Logo } from "@/components/logo";
import { Eye, EyeOff } from 'lucide-react';


export default function SignInForm() {
  const router = useRouter();
  const [email, setEmail] = useState('') // do this first
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isSigningIn, setIsSigningIn] = useState(false)
  const [showPassword, setShowPassword] = useState(false);
  const { userLoggedIn , loading } = useAuth()


  useEffect(() => {
    // Check if the URL already has our reload parameter
    const urlParams = new URLSearchParams(window.location.search);
    const hasReloaded = urlParams.get('reloaded');
    
    if (!hasReloaded) {
      // Set timeout for the reload
      const timer = setTimeout(() => {
        // Add a parameter to the current URL to indicate we've reloaded
        const newUrl = new URL(window.location.href);
        newUrl.searchParams.set('reloaded', 'true');
        window.location.href = newUrl.toString();
      }, 1000);
      
      // Cleanup timeout if component unmounts
      return () => clearTimeout(timer);
    }
  }, []); // Runs only on mount


  useEffect(() => {
    if (userLoggedIn) {
      toast(
        <span className="glitch font-orbitron" data-text="🔴 ACCESS GRANTED 🔴">
           ACCESS GRANTED 
        </span>,
        {
          style: {
            background: "#001100", // Dark green background
            color: "#00ff00", // Neon green text
            border: "1px solid #00ff00", // Neon green border
            textShadow: "0 0 5px #00ff00, 0 0 10px #00ff55", // Glowing green effect
          },
        }
      );
      router.push('/');
    }
  }, [userLoggedIn,router]);



  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };



  const onGoogleSignIn = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (!isSigningIn) {
      setIsSigningIn(true);
      try {
        await doSignInWithGoogle(); 
        router.refresh();
      } catch (error) {
        console.error('Google Sign-In Error:', error);
        if (error instanceof Error) {
          toast(`Sign-in failed: ${error.message}`);
        }
      } finally {
        setIsSigningIn(false);
      }
    }
  };


  const onEmailSignIn = async (e: { preventDefault: () => void; }) => {
    e.preventDefault()
    if(!isSigningIn) {
        setIsSigningIn(true)
        try{
        await doSignInWithEmailAndPassword(email, password)
        // doSendEmailVerification()
        } catch(err){
          if(err instanceof Error){
          setError(err.message)
          setIsSigningIn(false)
          }
        }
    }
}


const onGitHubSignIn = async () => {
  try {
    await doSignInWithGitHub();
  } catch (error) {
    if( error instanceof Error){
    toast(error.message)
    }
  }
};
  

  return (
    
    <WavyBackground>
      <div className="p-6">
              <Logo />
            </div>
      <div className="max-w-md w-full mt-15 mx-auto rounded-none md:rounded-2xl p-4 md:p-8 shadow-input bg-white dark:bg-black/90">
      <h2 className="font-bold text-xl text-neutral-800 dark:text-neutral-200">
  Welcome to{" "}
  <span className="inline-block align-middle font-orbitron text-2xl font-bold ml-1 text-red-600 tracking-wider">
    PHANTOM
  </span>
</h2>
        <p className="text-neutral-600 text-sm max-w-sm mt-2 dark:text-neutral-300">
          Login to Phantom to continue building amazing websites
        </p>

        {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

        <form className="my-8" onSubmit={onEmailSignIn}>
          <LabelInputContainer className="mb-4">
            <Label htmlFor="email">Email Address</Label>
            <Input id="email" placeholder="contact@phantom.dev" autoComplete="current-email" type="email"  onChange={(e)=>{setEmail(e.target.value)}}/>
          </LabelInputContainer>
          <LabelInputContainer className="mb-8">
      <Label htmlFor="password">Password</Label>
      <div className="relative">
        <Input
          id="password"
            placeholder="••••••••"
            autoComplete="current-password"
            type={showPassword ? 'text' : 'password'}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button
            type="button"
            onClick={togglePasswordVisibility}
            className="absolute inset-y-0 right-0 pr-3 flex items-center text-sm leading-5"
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>
      </LabelInputContainer>

          <button
className="relative group bg-black hover:!bg-red-600 hover:!text-black font-orbitron dark:bg-zinc-800 w-full text-white rounded-md h-10 font-medium shadow-[0px_1px_0px_0px_#ffffff40_inset,0px_-1px_0px_0px_#ffffff40_inset] dark:shadow-[0px_1px_0px_0px_var(--zinc-800)_inset,0px_-1px_0px_0px_var(--zinc-800)_inset]"
type="submit"
          >
            {isSigningIn ? 'Signing In...' : 'Sign In'}
          </button>
          <p className="text-neutral-600 text-sm max-w-sm mt-5 ml-20 dark:text-neutral-300 ">
            Don't have an account?
            <Link href="/signUp">
            <span className="text-red-600 font-orbitron cursor-pointer hover:opacity-80"> Sign Up</span>
            </Link>
            </p>

            <div className="relative my-8">
            <div className="bg-gradient-to-r from-transparent via-neutral-300 dark:via-neutral-700 to-transparent h-[1px] w-full" />
            <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 px-2 bg-white dark:bg-black text-xs text-neutral-500 dark:text-neutral-400">
              OR
            </span>
          </div>

          <div className="flex flex-col space-y-4">
          <button className={`w-full flex items-center justify-center gap-x-3 py-2.5 border rounded-lg text-sm font-medium`}
           disabled={isSigningIn}
           onClick={onGitHubSignIn}
          >
          <svg className="w-5 h-5" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
          <g clipPath="url(#clip0_17_40)">
            <path
              fill="currentColor"
              d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"
            />
          </g>
          <defs>
            <clipPath id="clip0_17_41">
              <rect width="16" height="16" fill="white" />
            </clipPath>
          </defs>
        </svg>
        {isSigningIn ? 'Signing In...' : 'Continue with GitHub'}          
        </button>
          <button 
              className={`w-full flex items-center justify-center gap-x-3 py-2.5 border rounded-lg text-sm font-medium ${isSigningIn ? 'opacity-70 cursor-not-allowed' : ''}`}
              disabled={isSigningIn}
              onClick={onGoogleSignIn} 
            >
              <svg className="w-5 h-5" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                <g clipPath="url(#clip0_17_40)">
                  <path d="M47.532 24.5528C47.532 22.9214 47.3997 21.2811 47.1175 19.6761H24.48V28.9181H37.4434C36.9055 31.8988 35.177 34.5356 32.6461 36.2111V42.2078H40.3801C44.9217 38.0278 47.532 31.8547 47.532 24.5528Z" fill="#4285F4" />
                  <path d="M24.48 48.0016C30.9529 48.0016 36.4116 45.8764 40.3888 42.2078L32.6549 36.2111C30.5031 37.675 27.7252 38.5039 24.4888 38.5039C18.2275 38.5039 12.9187 34.2798 11.0139 28.6006H3.03296V34.7825C7.10718 42.8868 15.4056 48.0016 24.48 48.0016Z" fill="#34A853" />
                  <path d="M11.0051 28.6006C9.99973 25.6199 9.99973 22.3922 11.0051 19.4115V13.2296H3.03298C-0.371021 20.0112 -0.371021 28.0009 3.03298 34.7825L11.0051 28.6006Z" fill="#FBBC04" />
                  <path d="M24.48 9.49932C27.9016 9.44641 31.2086 10.7339 33.6866 13.0973L40.5387 6.24523C36.2 2.17101 30.4414 -0.068932 24.48 0.00161733C15.4055 0.00161733 7.10718 5.11644 3.03296 13.2296L11.005 19.4115C12.901 13.7235 18.2187 9.49932 24.48 9.49932Z" fill="#EA4335" />
                </g>
                <defs>
                  <clipPath id="clip0_17_40">
                    <rect width="48" height="48" fill="white" />
                  </clipPath>
                </defs>
              </svg>
              {isSigningIn ? 'Signing In...' : 'Continue with Google'}
            </button>
          </div>
        </form>
      </div>
    </WavyBackground>
  );
}

const LabelInputContainer = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => {
  return (
    <div className={cn("flex flex-col space-y-2 w-full", className)}>
      {children}
    </div>
  );
};