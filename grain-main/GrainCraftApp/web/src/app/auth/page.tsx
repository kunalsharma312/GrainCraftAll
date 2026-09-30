'use client';

import { useState } from 'react';
import { Header, Footer } from '@/components';
import { FiMail, FiLock, FiUser } from 'react-icons/fi';
import Link from 'next/link';

export default function AuthPage() {
  const [isSignIn, setIsSignIn] = useState(true);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      setLoading(false);
      console.log('Form submitted:', formData);
      // TODO: Dispatch auth action
    }, 1000);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  return (
    <>
      <Header cartCount={0} isAuthenticated={false} />

      <main className="min-h-screen bg-gradient-to-b from-white to-gray-50 flex items-center">
        <div className="container-max py-12">
          <div className="max-w-md mx-auto">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {isSignIn ? 'Welcome Back' : 'Create Account'}
              </h1>
              <p className="text-gray-600">
                {isSignIn
                  ? 'Sign in to your GrainCraft account'
                  : 'Join us for premium heritage grains'}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="card p-8 space-y-6">
              {/* Name Field (Sign Up Only) */}
              {!isSignIn && (
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">
                    Full Name
                  </label>
                  <div className="relative">
                    <FiUser className="absolute left-3 top-3 text-gray-400" size={18} />
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      placeholder="John Doe"
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:border-primary focus:ring-1 focus:ring-primary outline-none transition"
                      required
                    />
                  </div>
                </div>
              )}

              {/* Email Field */}
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <FiMail className="absolute left-3 top-3 text-gray-400" size={18} />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="you@example.com"
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:border-primary focus:ring-1 focus:ring-primary outline-none transition"
                    required
                  />
                </div>
              </div>

              {/* Password Field */}
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Password
                </label>
                <div className="relative">
                  <FiLock className="absolute left-3 top-3 text-gray-400" size={18} />
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:border-primary focus:ring-1 focus:ring-primary outline-none transition"
                    required
                  />
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full py-2 disabled:opacity-50"
              >
                {loading ? 'Processing...' : isSignIn ? 'Sign In' : 'Create Account'}
              </button>

              {/* Toggle Auth Mode */}
              <div className="text-center text-sm">
                <span className="text-gray-600">
                  {isSignIn ? "Don't have an account? " : 'Already have an account? '}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setIsSignIn(!isSignIn);
                    setFormData({ name: '', email: '', password: '' });
                  }}
                  className="text-primary hover:text-primary/80 font-semibold transition"
                >
                  {isSignIn ? 'Sign Up' : 'Sign In'}
                </button>
              </div>
            </form>

            {/* Divider */}
            <div className="flex items-center gap-4 my-8">
              <div className="flex-1 h-px bg-gray-300" />
              <span className="text-gray-600 text-sm">or</span>
              <div className="flex-1 h-px bg-gray-300" />
            </div>

            {/* Social Login */}
            <button className="w-full py-2 border-2 border-gray-300 rounded-lg font-medium text-gray-900 hover:bg-gray-50 transition mb-3">
              Continue with Google
            </button>

            <button className="w-full py-2 border-2 border-gray-300 rounded-lg font-medium text-gray-900 hover:bg-gray-50 transition">
              Continue as Guest
            </button>

            {/* Privacy Notice */}
            <p className="text-xs text-gray-600 text-center mt-6">
              By signing in, you agree to our{' '}
              <a href="#" className="text-primary hover:underline">
                Terms of Service
              </a>
              {' '}and{' '}
              <a href="#" className="text-primary hover:underline">
                Privacy Policy
              </a>
            </p>
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
}
