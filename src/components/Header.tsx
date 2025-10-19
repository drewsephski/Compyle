'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { UserButton, useAuth } from '@clerk/nextjs';
import { ThemeToggle } from './ThemeToggle';
import { cn } from '@/lib/utils';
import { useUser } from '@/hooks/useUser'; // Assuming this hook is created

export function Header() {
  const pathname = usePathname();
  const { isSignedIn } = useAuth();
  const { prismaUser } = useUser(); // Get additional user data

  const navLinks = [
    { name: 'Home', href: '/' },
    { name: 'Leagues', href: '/leagues' },
    { name: 'Discussions', href: '/discussions' },
  ];

  if (isSignedIn) {
    navLinks.push({ name: 'My Teams', href: '/teams' });
  }

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/80 backdrop-blur-lg">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link href="/" className="text-2xl font-bold text-primary">
            Fantasy MMA
          </Link>
          <nav className="hidden md:flex items-center space-x-4">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className={cn(
                  'text-sm font-medium transition-colors hover:text-primary',
                  pathname === link.href ? 'text-primary' : 'text-muted-foreground'
                )}
              >
                {link.name}
              </Link>
            ))}
          </nav>
        </div>
        <div className="flex items-center space-x-4">
          <ThemeToggle />
          {isSignedIn ? (
            <div className="flex items-center space-x-2">
              <UserButton afterSignOutUrl="/" />
              {/* Optional: display user's display name or username */}
              {prismaUser?.displayName && (
                <span className="text-sm hidden sm:block">Hi, {prismaUser.displayName}</span>
              )}
            </div>
          ) : (
            <>
              <Link href="/sign-in" className="text-sm font-medium text-muted-foreground hover:text-primary">
                Sign In
              </Link>
              <Link href="/sign-up" className="text-sm font-medium text-muted-foreground hover:text-primary">
                Sign Up
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}