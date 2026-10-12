'use client';

import Link from 'next/link';
import { Header, Footer, CartItem, EmptyState } from '@/components';
import { FiArrowRight } from 'react-icons/fi';
import { useState } from 'react';

export default function CartPage() {
  // Mock cart items - will be replaced with Redux state
  const [cartItems, setCartItems] = useState([
    {
      id: 'prod_001',
      name: 'Organic Wheat',
      subtitle: 'Premium heritage variety',
      price: 450,
      quantity: 2,
    },
    {
      id: 'prod_002',
      name: 'Basmati Rice',
      subtitle: 'Long grain aromatic rice',
      price: 320,
      quantity: 1,
    },
  ]);

  const total = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const itemCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  const handleUpdateQuantity = (id: string, quantity: number) => {
    setCartItems(items =>
      items.map(item =>
        item.id === id ? { ...item, quantity } : item
      )
    );
  };

  const handleRemove = (id: string) => {
    setCartItems(items => items.filter(item => item.id !== id));
  };

  if (cartItems.length === 0) {
    return (
      <>
        <Header cartCount={0} isAuthenticated={false} />
        <main className="min-h-screen bg-gray-50">
          <div className="container-max py-16">
            <EmptyState
              icon="🛒"
              title="Your Cart is Empty"
              message="Add some grains to get started. Browse our collection of premium heritage grains."
              action={{ label: 'Browse Products', href: '/products' }}
            />
          </div>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header cartCount={itemCount} isAuthenticated={false} />

      <main className="min-h-screen bg-gray-50">
        <div className="container-max py-12">
          <h1 className="text-3xl md:text-4xl font-bold mb-8 text-gray-900">
            Shopping Cart
          </h1>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              {cartItems.map(item => (
                <CartItem
                  key={item.id}
                  item={item}
                  onUpdateQuantity={handleUpdateQuantity}
                  onRemove={handleRemove}
                />
              ))}
            </div>

            {/* Order Summary */}
            <div className="card p-6 h-fit sticky top-20">
              <h2 className="text-xl font-bold mb-6 text-gray-900">
                Order Summary
              </h2>

              <div className="space-y-3 mb-6 pb-6 border-b border-gray-200">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal ({itemCount} items)</span>
                  <span>₹{total.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Delivery Fee</span>
                  <span className="text-success font-semibold">Free</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Tax</span>
                  <span>₹0</span>
                </div>
              </div>

              <div className="flex justify-between mb-6 text-lg font-bold">
                <span>Total</span>
                <span className="text-primary">₹{total.toFixed(2)}</span>
              </div>

              <Link
                href="/checkout"
                className="btn-primary w-full flex items-center justify-center gap-2 py-3"
              >
                Proceed to Checkout <FiArrowRight size={18} />
              </Link>

              <Link
                href="/products"
                className="w-full text-center py-2 mt-3 text-gray-600 hover:text-primary font-medium transition"
              >
                Continue Shopping
              </Link>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
}
