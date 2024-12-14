import 'typeface-orbitron';
import Link from 'next/link';
export function Logo () {
  return (
    <div className="p-6">
      <Link href="/" passHref>
        <span className="cursor-pointer inline-block hover:opacity-80 transition-opacity font-orbitron text-lg font-normal relative right-5 bottom-4">
          AI WEBSITE GENERATOR
        </span>
      </Link>
    </div>
  );
}




