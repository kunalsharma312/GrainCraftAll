'use client';

import Link from 'next/link';
import Image from 'next/image';
import { FiShoppingCart, FiTrendingUp, FiTruck, FiAward } from 'react-icons/fi';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      {/* Header */}
      <header className="border-b border-gray-200">
        <nav className="container-max py-4 flex justify-between items-center">
          <div className="text-2xl font-bold text-primary">🌾 GrainCraft</div>
          <div className="flex gap-4">
            <Link href="/products" className="text-gray-600 hover:text-primary transition">
              Browse
            </Link>
            <Link href="/cart" className="text-gray-600 hover:text-primary transition">
              Cart
            </Link>
            <Link href="/orders" className="text-gray-600 hover:text-primary transition">
              Orders
            </Link>
            <Link href="/auth" className="btn-primary text-sm">
              Sign In
            </Link>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="container-max py-16 md:py-24">
        <div className="grid md:grid-cols-2 gap-8 items-center">
          <div className="animate-slideInLeft">
            <h1 className="text-4xl md:text-5xl font-bold mb-4 text-gray-900">
              Premium Heritage Grains,{' '}
              <span className="text-primary">Fresh Stone-Milled</span>
            </h1>
            <p className="text-lg text-gray-600 mb-6">
              Discover authentic heritage grains and create custom blends tailored to your preferences. Milled fresh to order for maximum nutrition and flavor.
            </p>
            <div className="flex gap-4">
              <Link href="/products" className="btn-primary">
                Browse Products
              </Link>
              <Link href="/blend" className="btn-outline">
                Create Blend
              </Link>
            </div>
          </div>
          <div className="animate-fadeIn">
            <div className="bg-gradient-to-br from-primary to-secondary rounded-lg p-8 text-white text-center">
              <div className="text-6xl mb-4">🌾</div>
              <p className="text-xl font-semibold">Authentic Heritage Grains</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="bg-white py-16 md:py-24 border-y border-gray-200">
        <div className="container-max">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">Why Choose GrainCraft?</h2>
          <div className="grid md:grid-cols-4 gap-8">
            {[
              {
                icon: <FiAward className="w-8 h-8" />,
                title: 'Heritage Grains',
                description: 'Organic and traditional varieties sourced directly',
              },
              {
                icon: <FiTrendingUp className="w-8 h-8" />,
                title: 'Stone Milled',
                description: 'Fresh ground to order for maximum quality',
              },
              {
                icon: <FiTruck className="w-8 h-8" />,
                title: 'Fast Delivery',
                description: 'Local delivery available in 4-5 days',
              },
              {
                icon: <FiShoppingCart className="w-8 h-8" />,
                title: 'Custom Blends',
                description: 'Create your own perfect grain blend',
              },
            ].map((feature, i) => (
              <div key={i} className="card p-6 text-center animate-slideInUp" style={{ animationDelay: `${i * 100}ms` }}>
                <div className="text-primary mb-4 flex justify-center">{feature.icon}</div>
                <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                <p className="text-gray-600 text-sm">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-primary to-secondary py-16 md:py-24">
        <div className="container-max text-center text-white">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to Experience Premium Grains?</h2>
          <p className="text-lg mb-8 opacity-90">Join thousands of customers enjoying fresh heritage grains delivered to their doorstep</p>
          <Link href="/products" className="inline-block px-8 py-3 bg-white text-primary rounded-lg font-semibold hover:bg-opacity-90 transition">
            Start Shopping Now
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-12">
        <div className="container-max">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <h3 className="text-white font-semibold mb-4">GrainCraft</h3>
              <p className="text-sm">Premium heritage grains, fresh stone-milled to order.</p>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Products</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="/products" className="hover:text-white transition">Browse</Link></li>
                <li><Link href="/blend" className="hover:text-white transition">Create Blend</Link></li>
                <li><a href="#" className="hover:text-white transition">About Us</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Account</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="/auth" className="hover:text-white transition">Sign In</Link></li>
                <li><Link href="/orders" className="hover:text-white transition">My Orders</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="mailto:support@graincraftapp.com" className="hover:text-white transition">Email</a></li>
                <li><a href="#" className="hover:text-white transition">FAQ</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 text-center text-sm">
            <p>&copy; 2024 GrainCraft. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
