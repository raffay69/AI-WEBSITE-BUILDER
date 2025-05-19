"use client"
import { motion, AnimatePresence } from "framer-motion"
import { X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/app/auth/authContext"
import { Logo, Logo2 } from "../logo"
import Link from "next/link"
import { useEffect, useState } from "react"
import { deleteUserContent, getUserContent } from "@/app/auth/firebase"
import { Skeleton } from "./skeleton"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import {Trash} from "lucide-react"
import { toast } from "sonner"

interface ClaudeSidebarProps {
  isOpen: boolean
  setIsOpen: (isOpen: boolean) => void
  color : string
}


export function ClaudeSidebar({isOpen, setIsOpen , color }: ClaudeSidebarProps) {
   const { currentUser}  = useAuth()
   const [content, setContent] = useState<{ id: string; title: string ; chatID : string ; prompt : string ; type:string}[]>([]);
   const [loading, setLoading] = useState(true);
   const searchParams = useSearchParams(); 
   const pathName = usePathname()
   const router = useRouter()


   const chatID = searchParams?.get('chat');

   useEffect(() => {
    const fetchData = async () => {
      try {
        if (!currentUser?.uid) {
          setLoading(false);
          return;
        }
        
        const userContent = await getUserContent(currentUser.uid);
        const sortedContent = [...userContent].sort((a, b) => 
          b.timestamp.getTime() - a.timestamp.getTime()
        );
        setContent(sortedContent);
      } catch (error) {
        console.error("Error fetching user content:", error);
      } finally {
        setTimeout(() => setLoading(false), 500);
      }
    };
    
    fetchData();
  }, [currentUser , isOpen , content ]);

  const imagePath = pathName.startsWith('/mobile')?"/phantom-mobile.png":"/phantom-mascot-logo_71220-38-removebg-preview.png"

  const deleteDoc = async (userid:string|undefined, chadid:string)=>{
    try{
      const res = await deleteUserContent(userid! , chadid)
      if(res.success){
        toast(
        <span className="glitch font-orbitron">
            Chat deleted successfully 
        </span>,
        {
          style: {
            background: "#001100", // Dark green background
            color: "#00ff00", // Neon green text
            border: "1px solid #00ff00", // Neon green border
            textShadow: "0 0 5px #00ff00, 0 0 10px #00ff55", // Glowing green effect
          },
        })
        router.push('/')
      }else{
        toast(
          <span className="glitch font-orbitron" data-text="🔴 SESSION TERMINATED 🔴">
            Error deleting Chat 
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
      } 
    }
    catch(e){
      toast(
        <span className="glitch font-orbitron" data-text="🔴 SESSION TERMINATED 🔴">
          Unexpected error deleting the Chat 
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
    }
  }


  return (
    <>
      {/* Backdrop when sidebar is open */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/20 z-40"
            onClick={() => setIsOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.div
        initial={{ x: "-100%" }}
        animate={{ x: isOpen ? 0 : "-100%" }}
        transition={{ type: "tween", duration: 0.15, ease: "easeInOut" }}
        className="fixed top-0 left-0 h-full w-[280px] z-[99] backdrop-blur-md bg-[rgba(0,0,0,0.03)] border-r border-[var(--border-color)]" style={{"--border-color":color} as React.CSSProperties }
        >
        <div className="flex flex-col h-full text-gray-200">
          {/* Header with Logo */}
          <div className="flex items-center justify-between p-4 border-b border-[var(--border-color)]" style={{"--border-color":color} as React.CSSProperties }>
            <div className="flex items-center">
              <div className="h-4 w-4 mr-3 mb-5">
              {pathName.startsWith('/mobile')?<Logo2 />:<Logo />}
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsOpen(false)}
              className="text-gray-400"
            >
              <X className="h-5 w-5 mt-2" />
            </Button>
          </div>

          {/* New chat */}
          <div className="px-3  mt-2">
            <Link href={pathName.startsWith('/mobile')?"/mobile":"/"} className={`flex items-center px-3 py-2 text-sm rounded-md hover:bg-red-950/40 group`}>
                <img 
                    src={imagePath}
                    alt="Title icon" 
                    className="w-8 h-8 mr-2 object-contain"
                />
                <span className={`font-orbitron text-[${color}] text-l`}>Start New Chat</span>
                </Link>
            </div>

          {/* Navigation */}
           {/*add conditional srollbar color  */}
          <nav className={`flex-1 overflow-y-auto py-4 ${pathName.startsWith('/mobile')?"scrollbar-purple":"scrollbar-red"} `}>
            <div className="px-3 py-2">
              <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Recents</h3> 
              <ul className="space-y-1">
              {loading ? (
                // Skeleton loading state
                <>
                  <li>
                    <div className="px-2 py-1">
                      <Skeleton className="h-8 w-full rounded-md" />
                    </div>
                  </li>
                  <li>
                    <div className="px-2 py-1">
                      <Skeleton className="h-8 w-full rounded-md" />
                    </div>
                  </li>
                  <li>
                    <div className="px-2 py-1">
                      <Skeleton className="h-8 w-full rounded-md" />
                    </div>
                  </li>
                  <li>
                    <div className="px-2 py-1">
                      <Skeleton className="h-8 w-full rounded-md" />
                    </div>
                  </li>
                  <li>
                    <div className="px-2 py-1">
                      <Skeleton className="h-8 w-full rounded-md" />
                    </div>
                  </li>
                </>
              ) : content.length > 0 ? (
                content.map((item) => (
                  <li 
                  key={item.id}
                  className={`relative flex items-center ${chatID === item.chatID ? 'bg-red-950/60' : ''}`}
                >
                  <Link
                    href={`${item.type == "mobile" ? "/mobile/editor/" :"/editor/"}?chat=${item.chatID}&prompt=${encodeURIComponent(item.prompt.trim())}`}  
                    passHref
                    legacyBehavior
                  >
                    <a
                      className="flex items-center px-2 py-0.5 text-sm rounded-md hover:bg-red-950/40 group flex-grow"
                      onClick={(e) => {
                        e.preventDefault();
                        window.location.href = `${item.type == "mobile" ? "/mobile/editor/" :"/editor/"}?chat=${item.chatID}&prompt=${encodeURIComponent(item.prompt.trim())}`;
                      }}
                    >
                      <img 
                        src={item.type==="mobile"?'/phantom-mobile.png':'/phantom-mascot-logo_71220-38-removebg-preview.png'}
                        alt="Title icon" 
                        className="w-8 h-8 mr-2 object-contain"
                      />
                      <span>{item.title}</span>
                    </a>
                  </Link>
                  <button 
                    className="absolute right-0 top-1/2 -translate-y-1/2 text-red-500 hover:text-red-700 px-2 py-1 rounded-md "
                    onClick={() => {
                      deleteDoc(currentUser?.uid,item.chatID)
                    }}
                  >
                    <Trash className="w-4 h-4" ></Trash>
                  </button>
                </li>
                ))
              ) : (
                <li>
                  <div className="px-2 py-1 text-sm text-gray-500">No Recent chats</div>
                </li>
              )}
              </ul>
            </div>
            </nav>

          {/* Footer */}
          <div className="p-4 border-t border-red-900/30">
            <div className="flex items-center">
              <div style={{backgroundColor : color==='red'?"#8B0000":color}} className= {`h-8 w-8 rounded-full flex items-center justify-center ${pathName.startsWith('/mobile')?"text-black":"text-white"} font-semibold `}>
                {currentUser?.displayName?.charAt(0)}
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium">{currentUser?.displayName}</p>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Trigger area - always visible at the edge */}
      <div className="fixed top-0 left-0 w-1 h-full z-30 bg-transparent" onMouseEnter={() => setIsOpen(true)} />
    </>
  )
}

