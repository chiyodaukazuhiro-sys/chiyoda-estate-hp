"use client";

import Link from "next/link";
import { useState } from "react";

const navLinks = [
  { href: "/", label: "ホーム" },
  { href: "/company", label: "会社概要" },
  { href: "/services", label: "事業内容" },
  { href: "/contact", label: "お問い合わせ" },
  { href: "/member", label: "会員ページ" },
];

export default function Header() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <header className="bg-navy text-white sticky top-0 z-50 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            {/* CE Monogram */}
            <div className="relative w-11 h-11 sm:w-12 sm:h-12 flex-shrink-0">
              <div className="absolute inset-0 border border-gold/60 rotate-45" />
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="font-display text-gold text-lg sm:text-xl font-medium tracking-wider">
                  CE
                </span>
              </div>
            </div>
            <div className="flex flex-col">
              <span className="font-display text-lg sm:text-xl font-medium tracking-[0.2em] text-gold leading-tight">
                CHIYODA ESTATE
              </span>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="block w-5 h-px bg-gold/50" />
                <span className="text-[10px] tracking-[0.15em] text-gray-400 font-light">
                  チヨダエステート株式会社
                </span>
              </div>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-8">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm font-medium text-gray-200 hover:text-gold transition-colors duration-200 tracking-wide"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden text-gray-200 hover:text-gold"
            onClick={() => setIsOpen(!isOpen)}
            aria-label="メニュー"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {isOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <nav className="md:hidden pb-4 border-t border-gray-700">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="block py-3 px-2 text-sm text-gray-200 hover:text-gold hover:bg-navy-light transition-colors"
                onClick={() => setIsOpen(false)}
              >
                {link.label}
              </Link>
            ))}
          </nav>
        )}
      </div>
    </header>
  );
}
