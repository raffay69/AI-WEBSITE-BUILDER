import 'typeface-orbitron';
import Link from 'next/link';
export function Logo () {
  return (
    <div className="p-6">
  <Link href="/" passHref>
    <span className="cursor-pointer inline-block hover:opacity-80 transition-opacity font-orbitron text-2xl font-bold relative right-5 bottom-4 text-red-600 tracking-wider">
      PHANTOM
    </span>
  </Link>
</div>
  );
}




