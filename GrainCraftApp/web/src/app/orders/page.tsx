'use client';

import { Header, Footer, EmptyState } from '@/components';
import { useState } from 'react';
import { FiTruck, FiCheckCircle, FiClock } from 'react-icons/fi';

export default function OrdersPage() {
  // Mock orders - will be replaced with API call
  const [orders] = useState([
    {
      id: 'ORD_001',
      date: '2024-09-25',
      status: 'delivered',
      total: 770,
      items: [
        { name: 'Organic Wheat', quantity: 2, price: 450 },
      ],
      delivery: {
        address: '123 Market Street, Delhi',
        city: 'Delhi',
        state: 'Delhi',
        pincode: '110001',
      },
      estimatedDelivery: '2024-09-28',
    },
    {
      id: 'ORD_002',
      date: '2024-09-28',
      status: 'processing',
      total: 320,
      items: [
        { name: 'Basmati Rice', quantity: 1, price: 320 },
      ],
      delivery: {
        address: '456 Park Avenue, Delhi',
        city: 'Delhi',
        state: 'Delhi',
        pincode: '110002',
      },
      estimatedDelivery: '2024-10-02',
    },
  ]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'delivered':
        return <FiCheckCircle className="text-success" size={24} />;
      case 'processing':
        return <FiClock className="text-warning" size={24} />;
      case 'shipped':
        return <FiTruck className="text-primary" size={24} />;
      default:
        return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'delivered':
        return 'text-success';
      case 'processing':
        return 'text-warning';
      case 'shipped':
        return 'text-primary';
      default:
        return 'text-gray-600';
    }
  };

  if (orders.length === 0) {
    return (
      <>
        <Header cartCount={0} isAuthenticated={true} />
        <main className="min-h-screen bg-gray-50">
          <div className="container-max py-16">
            <EmptyState
              icon="📦"
              title="No Orders Yet"
              message="You haven't placed any orders yet. Start shopping to get premium grains delivered to your doorstep."
              action={{ label: 'Start Shopping', href: '/products' }}
            />
          </div>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header cartCount={0} isAuthenticated={true} />

      <main className="min-h-screen bg-gray-50">
        <div className="container-max py-12">
          <h1 className="text-3xl md:text-4xl font-bold mb-8 text-gray-900">
            My Orders
          </h1>

          <div className="space-y-6">
            {orders.map(order => (
              <div key={order.id} className="card p-6 md:p-8">
                <div className="grid md:grid-cols-3 gap-6 mb-6 pb-6 border-b border-gray-200">
                  {/* Order ID & Date */}
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Order ID</p>
                    <p className="font-mono font-bold text-gray-900">{order.id}</p>
                    <p className="text-sm text-gray-600 mt-2">
                      {new Date(order.date).toLocaleDateString('en-IN', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </p>
                  </div>

                  {/* Status */}
                  <div>
                    <p className="text-sm text-gray-600 mb-2">Status</p>
                    <div className="flex items-center gap-2">
                      {getStatusIcon(order.status)}
                      <span className={`font-semibold capitalize ${getStatusColor(order.status)}`}>
                        {order.status}
                      </span>
                    </div>
                  </div>

                  {/* Total */}
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Total</p>
                    <p className="text-2xl font-bold text-primary">
                      ₹{order.total.toFixed(2)}
                    </p>
                  </div>
                </div>

                {/* Items */}
                <div className="mb-6">
                  <p className="font-semibold text-gray-900 mb-3">Items</p>
                  <div className="space-y-2">
                    {order.items.map((item, idx) => (
                      <div key={idx} className="flex justify-between text-sm">
                        <span className="text-gray-600">
                          {item.name} × {item.quantity}
                        </span>
                        <span className="font-semibold text-gray-900">
                          ₹{(item.price * item.quantity).toFixed(2)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Delivery Info */}
                <div className="grid md:grid-cols-2 gap-6 pt-6 border-t border-gray-200">
                  <div>
                    <p className="text-sm text-gray-600 mb-2">Delivery Address</p>
                    <p className="text-gray-900 font-medium">{order.delivery.address}</p>
                    <p className="text-sm text-gray-600">
                      {order.delivery.city}, {order.delivery.state} {order.delivery.pincode}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-2">Estimated Delivery</p>
                    <p className="text-gray-900 font-medium">
                      {new Date(order.estimatedDelivery).toLocaleDateString('en-IN', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </p>
                  </div>
                </div>

                <button className="btn-outline w-full mt-6">
                  View Details
                </button>
              </div>
            ))}
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
}
