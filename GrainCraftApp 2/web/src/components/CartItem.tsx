'use client';

import { FiMinus, FiPlus, FiTrash2 } from 'react-icons/fi';

interface CartItemData {
  id: string;
  name: string;
  subtitle?: string;
  price: number;
  quantity: number;
}

interface CartItemProps {
  item: CartItemData;
  onUpdateQuantity: (id: string, quantity: number) => void;
  onRemove: (id: string) => void;
}

export default function CartItem({
  item,
  onUpdateQuantity,
  onRemove,
}: CartItemProps) {
  const subtotal = item.price * item.quantity;

  return (
    <div className="card p-4 md:p-6 flex gap-4 md:gap-6 animate-slideInUp">
      {/* Product Image */}
      <div className="w-20 h-20 md:w-24 md:h-24 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0 text-4xl">
        🌾
      </div>

      {/* Product Details */}
      <div className="flex-1 min-w-0">
        <h3 className="font-semibold text-lg text-gray-900 line-clamp-2">
          {item.name}
        </h3>
        {item.subtitle && (
          <p className="text-sm text-gray-600 line-clamp-1 mt-1">
            {item.subtitle}
          </p>
        )}

        <div className="flex items-center justify-between mt-4">
          <p className="font-semibold text-primary text-lg">
            ₹{subtotal.toFixed(2)}
          </p>

          {/* Quantity Controls */}
          <div className="flex items-center gap-3 bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => onUpdateQuantity(item.id, Math.max(1, item.quantity - 1))}
              className="p-1 hover:bg-white rounded transition"
              aria-label="Decrease quantity"
            >
              <FiMinus size={16} className="text-gray-600" />
            </button>

            <span className="w-8 text-center font-semibold text-gray-900">
              {item.quantity}
            </span>

            <button
              onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
              className="p-1 hover:bg-white rounded transition"
              aria-label="Increase quantity"
            >
              <FiPlus size={16} className="text-gray-600" />
            </button>
          </div>
        </div>
      </div>

      {/* Remove Button */}
      <button
        onClick={() => onRemove(item.id)}
        className="p-2 text-error hover:bg-red-50 rounded transition flex-shrink-0"
        aria-label="Remove item"
      >
        <FiTrash2 size={20} />
      </button>
    </div>
  );
}
