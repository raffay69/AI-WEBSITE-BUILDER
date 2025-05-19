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

export function Logo2() {
  return (
    <div className="p-6">
      <Link href="/mobile" passHref>
        <div className="inline-flex items-center cursor-pointer hover:opacity-80 transition-opacity relative right-5 bottom-4">
          <span className="font-orbitron text-2xl font-bold text-[#8A2BE2] tracking-wider">
            PHANTOM
          </span>
          <span className="font-orbitron text-sm text-[#B98DF0] ml-1 self-end mb-1">
            mobile
          </span>
        </div>
      </Link>
    </div>
  );
}

