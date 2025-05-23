import Link from 'next/link';
import { UserCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Logo from '@/components/shared/Logo';

export default function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60">
      <div className="container flex h-16 items-center justify-between max-w-2xl mx-auto px-4">
        <Logo />
        <Link href="/profile" passHref>
          <Button variant="ghost" size="icon" aria-label="User Profile">
            <UserCircle2 className="h-6 w-6 text-primary" />
          </Button>
        </Link>
      </div>
    </header>
  );
}
