import Link from "next/link";
import { Crown, Mail, Instagram, Facebook } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-border/40 bg-charcoal text-white">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Crown className="h-6 w-6 text-gold" />
              <span className="font-serif text-lg font-bold">Crown & Canvas</span>
            </div>
            <p className="text-sm text-white/60 leading-relaxed">
              Transform your beloved pet into a majestic royal portrait. Premium quality, crafted with love.
            </p>
          </div>

          {/* Shop */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-gold">Shop</h3>
            <ul className="space-y-2">
              <li><Link href="/styles" className="text-sm text-white/60 hover:text-white transition-colors">Browse Styles</Link></li>
              <li><Link href="/order/upload" className="text-sm text-white/60 hover:text-white transition-colors">Create Portrait</Link></li>
              <li><Link href="/cart" className="text-sm text-white/60 hover:text-white transition-colors">Cart</Link></li>
            </ul>
          </div>

          {/* Company */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-gold">Company</h3>
            <ul className="space-y-2">
              <li><Link href="/about" className="text-sm text-white/60 hover:text-white transition-colors">About Us</Link></li>
              <li><Link href="/faq" className="text-sm text-white/60 hover:text-white transition-colors">FAQ</Link></li>
              <li><Link href="/privacy" className="text-sm text-white/60 hover:text-white transition-colors">Privacy Policy</Link></li>
              <li><Link href="/terms" className="text-sm text-white/60 hover:text-white transition-colors">Terms of Service</Link></li>
            </ul>
          </div>

          {/* Connect */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-gold">Connect</h3>
            <div className="flex gap-4">
              <a href="#" className="text-white/60 hover:text-white transition-colors" aria-label="Instagram">
                <Instagram className="h-5 w-5" />
              </a>
              <a href="#" className="text-white/60 hover:text-white transition-colors" aria-label="Facebook">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="#" className="text-white/60 hover:text-white transition-colors" aria-label="Email">
                <Mail className="h-5 w-5" />
              </a>
            </div>
            <p className="text-sm text-white/60">
              hello@crownandcanvas.com
            </p>
          </div>
        </div>

        <div className="mt-10 border-t border-white/10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-white/40">
            &copy; {new Date().getFullYear()} Crown & Canvas. All rights reserved.
          </p>
          <div className="flex gap-4 text-xs text-white/40">
            <span>100% Satisfaction Guarantee</span>
            <span>&middot;</span>
            <span>Secure Checkout</span>
            <span>&middot;</span>
            <span>Free Shipping on Canvas & Framed</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
