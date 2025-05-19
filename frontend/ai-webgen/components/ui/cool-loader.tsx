"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"

const futuristicMessages = ["Building your application", "Open the TERMINAL to check progress"]

export function CoolLoader() {
  const [messageIndex, setMessageIndex] = useState(0)

  useEffect(() => {
    const messageInterval = setInterval(() => {
      setMessageIndex((prev) => (prev + 1) % futuristicMessages.length)
    }, 2500)

    return () => clearInterval(messageInterval)
  }, [])

  return (
    <div className="relative flex flex-col items-center justify-center">
      {/* Main loader container */}
      <div className="relative flex items-center justify-center w-40 h-40">
        {/* Outer ring */}
        <motion.div
          className="absolute w-full h-full rounded-full opacity-20"
          style={{
            border: "1px solid rgba(255, 255, 255, 0.2)",
            background: "linear-gradient(135deg, rgba(255, 0, 128, 0.05), rgba(121, 40, 202, 0.05))",
          }}
          animate={{
            rotate: 360,
          }}
          transition={{
            duration: 20,
            repeat: Number.POSITIVE_INFINITY,
            ease: "linear",
          }}
        />

        {/* Middle ring with gradient */}
        <motion.div
          className="absolute w-32 h-32 rounded-full"
          style={{
            background: "transparent",
            border: "1px solid rgba(255, 255, 255, 0.1)",
            boxShadow: "0 0 30px rgba(255, 0, 128, 0.1)",
          }}
          animate={{
            rotate: -360,
            scale: [1, 1.02, 1],
          }}
          transition={{
            rotate: {
              duration: 15,
              repeat: Number.POSITIVE_INFINITY,
              ease: "linear",
            },
            scale: {
              duration: 3,
              repeat: Number.POSITIVE_INFINITY,
              ease: "easeInOut",
            },
          }}
        />

        {/* Inner circle with gradient */}
        <motion.div
          className="absolute w-24 h-24 rounded-full"
          style={{
            background: "radial-gradient(circle, rgba(255, 0, 128, 0.1) 0%, rgba(121, 40, 202, 0.1) 100%)",
            boxShadow: "inset 0 0 20px rgba(255, 0, 128, 0.2)",
          }}
          animate={{
            scale: [1, 1.1, 1],
          }}
          transition={{
            duration: 4,
            repeat: Number.POSITIVE_INFINITY,
            ease: "easeInOut",
          }}
        />

        {/* Rotating arc segments */}
        {[...Array(3)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full"
            style={{
              width: `${100 - i * 20}%`,
              height: `${100 - i * 20}%`,
              border: "1px solid transparent",
              borderTopColor:
                i === 0 ? "rgba(255, 0, 128, 0.7)" : i === 1 ? "rgba(200, 30, 150, 0.7)" : "rgba(121, 40, 202, 0.7)",
              borderRightColor:
                i === 0 ? "rgba(255, 0, 128, 0.2)" : i === 1 ? "rgba(200, 30, 150, 0.2)" : "rgba(121, 40, 202, 0.2)",
              boxShadow: `0 0 15px rgba(${i === 0 ? "255, 0, 128" : i === 1 ? "200, 30, 150" : "121, 40, 202"}, 0.3)`,
            }}
            animate={{
              rotate: 360,
            }}
            transition={{
              duration: 8 - i * 1.5,
              repeat: Number.POSITIVE_INFINITY,
              ease: "linear",
            }}
          />
        ))}

        {/* Pulsing center dot */}
        <motion.div
          className="absolute w-4 h-4 rounded-full bg-gradient-to-r from-red-500 to-purple-600"
          animate={{
            scale: [1, 1.5, 1],
            opacity: [0.7, 1, 0.7],
            boxShadow: [
              "0 0 10px rgba(255, 0, 128, 0.5)",
              "0 0 20px rgba(255, 0, 128, 0.8)",
              "0 0 10px rgba(255, 0, 128, 0.5)",
            ],
          }}
          transition={{
            duration: 2,
            repeat: Number.POSITIVE_INFINITY,
            ease: "easeInOut",
          }}
        />

        {/* Orbiting dots */}
        {[...Array(2)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 rounded-full bg-gradient-to-r from-red-500 to-purple-600"
            animate={{
              rotate: 360,
            }}
            transition={{
              duration: 4 + i * 2,
              repeat: Number.POSITIVE_INFINITY,
              ease: "linear",
            }}
            style={{
              transformOrigin: "center",
              left: "calc(50% - 1px)",
              top: i === 0 ? "5%" : "95%",
              boxShadow: "0 0 10px rgba(255, 0, 128, 0.5)",
            }}
          />
        ))}
      </div>

      {/* Elegant changing text */}
      <div className="relative mt-8">
        <motion.div
          className="absolute inset-0 flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          key={messageIndex}
        >
          <motion.p
            className="font-light tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-purple-600 whitespace-nowrap w-fit"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.5 }}
            style={{ fontFamily: "'SF Pro Display', -apple-system, BlinkMacSystemFont, sans-serif" }}
          >
            {futuristicMessages[messageIndex]}
          </motion.p>
        </motion.div>
        <div className="invisible font-light tracking-widest">{futuristicMessages[0]}</div>
      </div>

      {/* Thin progress bar */}
      <motion.div className="relative w-40 h-px mt-4 overflow-hidden bg-gray-800" style={{ borderRadius: "1px" }}>
        <motion.div
          className="absolute top-0 left-0 h-full bg-gradient-to-r from-red-500 to-purple-600"
          animate={{
            width: ["0%", "100%"],
            x: ["-100%", "0%", "100%"],
          }}
          transition={{
            width: {
              duration: 2.5,
              repeat: Number.POSITIVE_INFINITY,
              ease: "linear",
            },
            x: {
              duration: 2.5,
              repeat: Number.POSITIVE_INFINITY,
              ease: "linear",
            },
          }}
        />
      </motion.div>
    </div>
  )
}
