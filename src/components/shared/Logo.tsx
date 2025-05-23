import Link from 'next/link';
import { Building } from 'lucide-react';

export default function Logo() {
  return (
    <Link href="/" className="flex items-center space-x-2 group">
      <Building className="h-7 w-7 text-primary transition-transform group-hover:rotate-[15deg]" />
      <span className="text-2xl font-bold text-foreground tracking-tight">
        Civic<span className="text-primary">Connect</span>
      </span>
    </Link>
  );
}
