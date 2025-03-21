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


export default function AuthButtons() {
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
            className=" text-red-700 transition-all duration-300 font-orbitron px-6 py-2 rounded-md shadow-sm hover:shadow-md"
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
              className="flex items-center gap-2 hover:text-red-600 font-medium text-white"
            >
              <User className="h-4 w-4" />
              <span>{currentUser?.displayName}</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56 bg-black shadow-lg">
            <DropdownMenuItem
              className="hover:bg-red-900 text-white focus:bg-red-900 focus:text-white"
            >
              <LogOut className="mr-2 h-4 w-4 text-red-600" />
              <span onClick={signOut} >Logout</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </div>
  )
}