'use client';

import { useState } from 'react';
import { FiShoppingCart, FiHeart } from 'react-icons/fi';
import { FaHeart } from 'react-icons/fa';

interface Product {
  id: string;
  name: string;
  subtitle?: string;
  price: number;
  image?: string;
  rating?: number;
  reviews?: number;
}

interface ProductCardProps {
  product: Product;
  onAddToCart: (product: Product) => void;
  onWishlist?: (product: Product) => void;
}

export default function ProductCard({ product, onAddToCart, onWishlist }: ProductCardProps) {
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [isAdding, setIsAdding] = useState(false);

  const handleAddToCart = async () => {
    setIsAdding(true);
    onAddToCart(product);
    setTimeout(() => setIsAdding(false), 300);
  };

  const handleWishlist = () => {
    setIsWishlisted(!isWishlisted);
    onWishlist?.(product);
  };

  return (
    <div className="card overflow-hidden group hover:shadow-hover transition-all duration-200 animate-scaleIn">
      {/* Image */}
      <div className="relative bg-gray-100 aspect-square overflow-hidden">
        <div className="w-full h-full flex items-center justify-center text-6xl group-hover:scale-105 transition-transform duration-300">
          🌾
        </div>
        <button
          onClick={handleWishlist}
          className="absolute top-3 right-3 p-2 bg-white rounded-full shadow hover:bg-gray-100 transition z-10"
          aria-label="Add to wishlist"
        >
          {isWishlisted ? (
            <FaHeart className="text-error" size={18} />
          ) : (
            <FiHeart className="text-gray-400 hover:text-error" size={18} />
          )}
        </button>
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="font-semibold text-lg text-gray-900 line-clamp-2 mb-1">
          {product.name}
        </h3>

        {product.subtitle && (
          <p className="text-sm text-gray-600 line-clamp-1 mb-3">
            {product.subtitle}
          </p>
        )}

        {/* Rating */}
        {product.rating && (
          <div className="flex items-center gap-2 mb-3">
            <div className="flex gap-1">
              {[...Array(5)].map((_, i) => (
                <span
                  key={i}
                  className={`text-sm ${
                    i < Math.floor(product.rating!) ? 'text-yellow-400' : 'text-gray-300'
                  }`}
                >
                  ★
                </span>
              ))}
            </div>
            {product.reviews && (
              <span className="text-xs text-gray-600">
                ({product.reviews} reviews)
              </span>
            )}
          </div>
        )}

        {/* Price and Button */}
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-sm text-gray-600">Price</p>
            <p className="text-2xl font-bold text-primary">
              ₹{product.price.toFixed(2)}
            </p>
          </div>

          <button
            onClick={handleAddToCart}
            disabled={isAdding}
            className="btn-primary p-3 rounded-lg flex-shrink-0 hover:shadow-lg transition disabled:opacity-70"
            aria-label="Add to cart"
          >
            <FiShoppingCart size={20} />
          </button>
        </div>
      </div>
    </div>
  );
}
