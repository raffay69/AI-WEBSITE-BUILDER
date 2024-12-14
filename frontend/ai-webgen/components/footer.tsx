import { Github, Twitter } from 'lucide-react'

export function Footer() {
  return (
    <footer className="p-4 flex items-center justify-between text-sm text-gray-400">
      <div className="flex items-center gap-4">
        <a href="#" className="hover:text-white">
          <Twitter className="w-4 h-4" />
        </a>
        <a href="#" className="hover:text-white">
          <Github className="w-4 h-4" />
        </a>
        <a href="#" className="hover:text-white">
          Discord
        </a>
        <a href="#" className="hover:text-white">
          Help Center
        </a>
        <a href="#" className="hover:text-white">
          Terms
        </a>
        <a href="#" className="hover:text-white">
          Privacy
        </a>
      </div>
      <div>
        <a href="#" className="hover:text-white flex items-center gap-2">
          <span>⚡</span>
          <span>StackBlitz</span>
        </a>
      </div>
    </footer>
  )
}

