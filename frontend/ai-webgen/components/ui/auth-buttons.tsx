"use client"

import { useState } from "react"
import { LogOut, User } from "lucide-react"
import 'typeface-orbitron';
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import Link from "next/link";
import { useAuth } from "@/app/auth/authContext";
import { doSignOut } from "@/app/auth/auth";
import { useRouter } from 'next/navigation';
import { toast } from "sonner";


export default function AuthButtons({color}:{color:string}) {
  const {userLoggedIn , currentUser}  = useAuth()
  const router = useRouter();


  const signOut = ()=>{
    doSignOut().then(()=>{
      toast(
        <span className="glitch font-orbitron" data-text="🔴 SESSION TERMINATED 🔴">
          SESSION TERMINATED 
        </span>,
        {
          style: {
            background: "#110000",
            color: "#ff3131", 
            border: "1px solid #ff0000", 
            textShadow: "0 0 5px #ff0000, 0 0 10px #ff3131",
          },
        }
      );
      router.push('/') 
    })
  }


  return (
    <div className="flex -space-x-[30px]">
      {!userLoggedIn ? (
        <>
          <Button
            variant="ghost"
            className="text-white  transition-all duration-300 font-orbitron px-6 py-2 rounded-md"
          >
            <Link href="/signIn">
            Sign In
            </Link>
          </Button>
          <Button 
            className="transition-all duration-300 font-orbitron px-6 py-2 rounded-md shadow-sm hover:shadow-md"
            style={{color:color}}
          >
            <Link href="/signUp">
            Sign Up
            </Link>
          </Button>
        </>
      ) : (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button 
              variant="ghost" 
              className="flex items-center gap-2 hover:text-[var(--hover-color)] font-medium text-white" style={{'--hover-color': color} as React.CSSProperties}
            >
              <User className="h-4 w-4" />
              <span >{currentUser?.displayName}</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56 bg-black shadow-lg hover:bg-[var(--hover-color)]" style={{'--hover-color':color } as React.CSSProperties}>
            <DropdownMenuItem
              className="cursor-pointer" 
              onClick={signOut}
            >
              <LogOut className="mr-2 h-4 w-4 " />
              <span >Logout</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </div>
  )
}