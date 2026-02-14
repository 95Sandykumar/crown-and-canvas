"use client";

import Link from "next/link";
import { useState } from "react";
import { ShoppingCart, Menu, X, Crown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { NAV_LINKS } from "@/lib/constants";
import { useCart } from "@/hooks/use-cart";
import { formatPrice } from "@/data/products";

export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { itemCount, subtotal, isHydrated } = useCart();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-white/80 backdrop-blur-lg">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <Crown className="h-7 w-7 text-gold" />
          <span className="font-serif text-xl font-bold text-charcoal tracking-tight">
            Crown & Canvas
          </span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-8">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-charcoal/70 transition-colors hover:text-royal"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-3">
          <Link href="/order/upload">
            <Button size="sm" className="hidden sm:inline-flex bg-royal hover:bg-royal-dark text-white">
              Create Portrait
            </Button>
          </Link>

          <Link href="/cart" className="relative p-2 text-charcoal/70 hover:text-royal transition-colors">
            <ShoppingCart className="h-5 w-5" />
            {isHydrated && itemCount > 0 && (
              <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-gold text-[10px] font-bold text-charcoal">
                {itemCount}
              </span>
            )}
          </Link>

          {/* Mobile Menu Toggle */}
          <button
            className="md:hidden p-2 text-charcoal/70"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-border/40 bg-white animate-fade-in">
          <nav className="flex flex-col px-4 py-4 gap-1">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="rounded-lg px-3 py-2.5 text-sm font-medium text-charcoal/70 hover:bg-cream hover:text-royal transition-colors"
                onClick={() => setMobileOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            <Link href="/order/upload" onClick={() => setMobileOpen(false)}>
              <Button className="mt-2 w-full bg-royal hover:bg-royal-dark text-white">
                Create Portrait
              </Button>
            </Link>
            {isHydrated && itemCount > 0 && (
              <Link href="/cart" onClick={() => setMobileOpen(false)}>
                <Button variant="outline" className="mt-1 w-full">
                  Cart ({itemCount}) &mdash; {formatPrice(subtotal)}
                </Button>
              </Link>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
