"use client";
import { TypewriterEffectSmooth } from "@/components/ui/typewriter-effect";
import { Github } from "lucide-react";
export function TypewriterEffectSmoothDemo() {
  const words = [
    {
      text: "Created",
      className:"text-lg font-orbitron font-normal"
    },
    {
      text: "by",
      className:"text-lg font-orbitron font-normal"
    },
    {
      text: "Mohammed",
      className:"text-lg font-orbitron font-normal"
    },
    {
      text: "Abdul",
      className:"text-lg font-orbitron font-normal"
    },
    {
      text: "Raffay",
      className: "text-lg text-customRed dark:text-customRed1 font-orbitron font-normal",
    },
  ];
  return (
    <div className="flex flex-col items-center justify-center relative top-[8rem]">
      <TypewriterEffectSmooth words={words} />
      <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 space-x-0 md:space-x-4">
        <button className="inline w-40 h-10  bg-customRed hover:bg-customRed1  text-stone-400 hover:text-white text-sm">
        <a target="_blank" href="https://github.com/raffay69/AI-WEBSITE-BUILDER">
        GitHub<Github className="inline" />
        </a>
        </button>
      </div>
    </div>
  );
}
