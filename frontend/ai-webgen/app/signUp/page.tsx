"use client";
import React, { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import 'typeface-orbitron';
import { WavyBackground } from "@/components/ui/wavy-background";
import { Logo } from "@/components/logo";
import { useAuth } from "../auth/authContext";
import { doCreateUserWithEmailAndPassword } from "../auth/auth";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";

export default function SignUpForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName , setDisplayName] = useState("")
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);
  const [error, setError] = useState('');
  const { userLoggedIn } = useAuth();
  const [showPassword, setShowPassword] = useState(false); 
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const router = useRouter()

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
  
    const toggleConfirmPasswordVisibility = () => {
      setShowConfirmPassword(!showConfirmPassword);
    };


  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const hasReloaded = urlParams.get('reloaded');
    
    if (!hasReloaded) {
      const timer = setTimeout(() => {
        const newUrl = new URL(window.location.href);
        newUrl.searchParams.set('reloaded', 'true');
        window.location.href = newUrl.toString();
      }, 1000);
      
      return () => clearTimeout(timer);
    }
  }, []);

  const onSubmit = async (e: { preventDefault: () => void; }) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (!isRegistering) {
      setIsRegistering(true);
      try {
        await doCreateUserWithEmailAndPassword(email, password, displayName);
      } catch (err) {
        // Handle the error properly
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError('An unknown error occurred');
        }
      } finally {
        setIsRegistering(false);
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
          Join{" "}
          <span className="inline-block align-middle font-orbitron text-2xl font-bold ml-1 text-red-600 tracking-wider">
            PHANTOM
          </span>
        </h2>
        <p className="text-neutral-600 text-sm max-w-sm mt-2 dark:text-neutral-300">
          Create your account to start building amazing websites
        </p>

        {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

        <form className="my-8" onSubmit={onSubmit}>
          <LabelInputContainer className="mb-4">
            <Label htmlFor="name">Name</Label>
            <Input id="name" placeholder="Kratos" type="text"  onChange={(e)=>{setDisplayName(e.target.value)}}/>
          </LabelInputContainer>

          <LabelInputContainer className="mb-4">
            <Label htmlFor="email">Email Address</Label>
            <Input id="email" placeholder="contact@phantom.dev" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
          </LabelInputContainer>
          
          <LabelInputContainer className="mb-4">
        <Label htmlFor="password">Password</Label>
        <div className="relative">
          <Input
            id="password"
            autoComplete="current-password"
            type={showPassword ? 'text' : 'password'}
            placeholder="••••••••"
            value={password}
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

      <LabelInputContainer className="mb-8">
        <Label htmlFor="confirmpassword">Confirm Password</Label>
        <div className="relative">
          <Input
            id="confirmpassword"
            placeholder="••••••••"
            autoComplete="current-password"
            type={showConfirmPassword ? 'text' : 'password'}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
          <button
            type="button"
            onClick={toggleConfirmPasswordVisibility}
            className="absolute inset-y-0 right-0 pr-3 flex items-center text-sm leading-5"
          >
            {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>
      </LabelInputContainer>

          <button
          className="relative group bg-black hover:!bg-red-600 hover:!text-black font-orbitron dark:bg-zinc-800 w-full text-white rounded-md h-10 font-medium shadow-[0px_1px_0px_0px_#ffffff40_inset,0px_-1px_0px_0px_#ffffff40_inset] dark:shadow-[0px_1px_0px_0px_var(--zinc-800)_inset,0px_-1px_0px_0px_var(--zinc-800)_inset]"
          type="submit"
            disabled={isRegistering}
          >
            {isRegistering ? 'Creating Account...' : 'Create Account'}
          </button>
          
          <p className="text-neutral-600 text-sm max-w-sm mt-5 ml-20 dark:text-neutral-300 ">
            Already have an account?
            <Link href="/signIn">
              <span className="text-red-600 font-orbitron cursor-pointer hover:opacity-80"> Sign In</span>
            </Link>
          </p>
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