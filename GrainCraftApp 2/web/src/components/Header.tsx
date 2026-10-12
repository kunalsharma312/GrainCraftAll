'use client';

import Link from 'next/link';
import { useState } from 'react';
import { FiMenu, FiX, FiShoppingCart, FiUser } from 'react-icons/fi';

interface HeaderProps {
  cartCount?: number;
  isAuthenticated?: boolean;
}

export default function Header({ cartCount = 0, isAuthenticated = false }: HeaderProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
      <nav className="container-max py-4 flex justify-between items-center">
        {/* Logo */}
        <Link href="/" className="text-2xl font-bold text-primary hover:text-primary/80 transition">
          🌾 GrainCraft
        </Link>

        {/* Desktop Menu */}
        <div className="hidden md:flex gap-8 items-center">
          <Link href="/products" className="text-gray-600 hover:text-primary transition font-medium">
            Browse
          </Link>
          <Link href="/blend" className="text-gray-600 hover:text-primary transition font-medium">
            Create Blend
          </Link>
          <Link href="/about" className="text-gray-600 hover:text-primary transition font-medium">
            About
          </Link>

          {/* Right side icons */}
          <div className="flex gap-4 items-center">
            {/* Cart */}
            <Link href="/cart" className="relative hover:text-primary transition">
              <FiShoppingCart size={24} />
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-error text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </Link>

            {/* User */}
            {isAuthenticated ? (
              <Link href="/profile" className="hover:text-primary transition">
                <FiUser size={24} />
              </Link>
            ) : (
              <Link href="/auth" className="btn-primary text-sm">
                Sign In
              </Link>
            )}
          </div>
        </div>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden p-2 hover:bg-gray-100 rounded transition"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          aria-label="Toggle menu"
        >
          {isMenuOpen ? <FiX size={24} /> : <FiMenu size={24} />}
        </button>
      </nav>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden border-t border-gray-200 bg-white">
          <div className="container-max py-4 space-y-4">
            <Link href="/products" className="block text-gray-600 hover:text-primary font-medium transition">
              Browse Products
            </Link>
            <Link href="/blend" className="block text-gray-600 hover:text-primary font-medium transition">
              Create Blend
            </Link>
            <Link href="/about" className="block text-gray-600 hover:text-primary font-medium transition">
              About Us
            </Link>
            <div className="border-t pt-4 space-y-4">
              <Link href="/cart" className="flex items-center gap-2 text-gray-600 hover:text-primary transition">
                <FiShoppingCart /> Cart {cartCount > 0 && `(${cartCount})`}
              </Link>
              {isAuthenticated ? (
                <Link href="/profile" className="flex items-center gap-2 text-gray-600 hover:text-primary transition">
                  <FiUser /> Profile
                </Link>
              ) : (
                <Link href="/auth" className="btn-primary block text-center">
                  Sign In
                </Link>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
