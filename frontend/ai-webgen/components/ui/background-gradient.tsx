import { cn } from "@/lib/utils"
import type React from "react"
import { motion } from "framer-motion"

export const BackgroundGradient = ({
  children,
  className,
  containerClassName,
  animate = true,
  colorTheme = "red", // Add color theme prop with default "red"
}: {
  children?: React.ReactNode
  className?: string
  containerClassName?: string
  animate?: boolean
  colorTheme?: "red" | "purple" // Add type for color theme
}) => {
  // Define gradient backgrounds based on color theme
  const gradientBg = {
    red: "bg-[radial-gradient(circle_farthest-side_at_0_100%,#8B0000,transparent),radial-gradient(circle_farthest-side_at_100%_0,#FF0000,transparent),radial-gradient(circle_farthest-side_at_100%_100%,#FF6B6B,transparent),radial-gradient(circle_farthest-side_at_0_0,#FF1493,#141316)]",
    purple: "bg-[radial-gradient(circle_farthest-side_at_0_100%,#4B0082,transparent),radial-gradient(circle_farthest-side_at_100%_0,#8A2BE2,transparent),radial-gradient(circle_farthest-side_at_100%_100%,#B98DF0,transparent),radial-gradient(circle_farthest-side_at_0_0,#9370DB,#141316)]"
  };

  const variants = {
    initial: {
      backgroundPosition: "0 50%",
    },
    animate: {
      backgroundPosition: ["0 50%", "100% 50%", "0 50%"],
    },
  }
  
  return (
    <div className={cn("relative p-[1px] group", containerClassName)}>
      <motion.div
        variants={animate ? variants : undefined}
        initial={animate ? "initial" : undefined}
        animate={animate ? "animate" : undefined}
        transition={
          animate
            ? {
                duration: 5,
                repeat: Infinity,
                repeatType: "reverse",
              }
            : undefined
        }
        style={{
          backgroundSize: animate ? "400% 400%" : undefined,
        }}
        className={cn(
          "absolute inset-0 rounded-2xl z-[1] opacity-60 group-hover:opacity-100 blur-xl transition duration-500 will-change-transform",
          gradientBg[colorTheme]
        )}
      />
      <motion.div
        variants={animate ? variants : undefined}
        initial={animate ? "initial" : undefined}
        animate={animate ? "animate" : undefined}
        transition={
          animate
            ? {
                duration: 5,
                repeat: Infinity,
                repeatType: "reverse",
              }
            : undefined
        }
        style={{
          backgroundSize: animate ? "400% 400%" : undefined,
        }}
        className={cn(
          "absolute inset-0 rounded-3xl z-[1] will-change-transform",
          gradientBg[colorTheme]
        )}
      />
      
      <div className={cn("relative z-10", className)}>{children}</div>
    </div>
  )
}