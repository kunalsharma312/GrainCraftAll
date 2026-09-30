'use client';

import Link from 'next/link';
import { FiMail, FiPhone, FiMapPin } from 'react-icons/fi';

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-400 mt-20">
      {/* Main Content */}
      <div className="container-max py-16 md:py-20">
        <div className="grid md:grid-cols-4 gap-8 mb-8">
          {/* Brand */}
          <div>
            <h3 className="text-white font-bold text-xl mb-4">🌾 GrainCraft</h3>
            <p className="text-sm leading-relaxed">
              Premium heritage grains, fresh stone-milled to order. Delivering quality and authenticity to your doorstep.
            </p>
          </div>

          {/* Products */}
          <div>
            <h4 className="text-white font-semibold mb-4">Products</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/products" className="hover:text-white transition">
                  Browse Grains
                </Link>
              </li>
              <li>
                <Link href="/blend" className="hover:text-white transition">
                  Create Blend
                </Link>
              </li>
              <li>
                <a href="#" className="hover:text-white transition">
                  About Us
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition">
                  Our Story
                </a>
              </li>
            </ul>
          </div>

          {/* Account */}
          <div>
            <h4 className="text-white font-semibold mb-4">Account</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/auth" className="hover:text-white transition">
                  Sign In / Sign Up
                </Link>
              </li>
              <li>
                <Link href="/orders" className="hover:text-white transition">
                  My Orders
                </Link>
              </li>
              <li>
                <Link href="/profile" className="hover:text-white transition">
                  My Profile
                </Link>
              </li>
              <li>
                <Link href="/cart" className="hover:text-white transition">
                  Shopping Cart
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-white font-semibold mb-4">Contact Us</h4>
            <ul className="space-y-3 text-sm">
              <li className="flex items-center gap-2">
                <FiMail size={16} className="text-primary" />
                <a href="mailto:support@graincraftapp.com" className="hover:text-white transition">
                  support@graincraftapp.com
                </a>
              </li>
              <li className="flex items-center gap-2">
                <FiPhone size={16} className="text-primary" />
                <a href="tel:+91-1234567890" className="hover:text-white transition">
                  +91 1234 567890
                </a>
              </li>
              <li className="flex items-start gap-2">
                <FiMapPin size={16} className="text-primary mt-0.5 flex-shrink-0" />
                <span>123 Market Street, Delhi, India</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-gray-800 pt-8 grid md:grid-cols-2 gap-4 items-center">
          {/* Copyright */}
          <p className="text-sm">
            &copy; 2024 GrainCraft. All rights reserved.
          </p>

          {/* Links */}
          <div className="flex gap-6 text-sm md:justify-end">
            <a href="#" className="hover:text-white transition">
              Privacy Policy
            </a>
            <a href="#" className="hover:text-white transition">
              Terms of Service
            </a>
            <a href="#" className="hover:text-white transition">
              Shipping Info
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
