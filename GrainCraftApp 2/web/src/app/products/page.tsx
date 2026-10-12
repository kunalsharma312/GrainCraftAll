'use client';

import { useState } from 'react';
import { Header, Footer, ProductCard, SearchBar, LoadingSpinner, EmptyState, ErrorMessage } from '@/components';

export default function ProductsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Mock products - will be replaced with API call
  const [products] = useState([
    {
      id: 'prod_001',
      name: 'Organic Wheat',
      subtitle: 'Premium heritage variety',
      price: 450,
      rating: 4.5,
      reviews: 28,
    },
    {
      id: 'prod_002',
      name: 'Basmati Rice',
      subtitle: 'Long grain aromatic rice',
      price: 320,
      rating: 4.8,
      reviews: 45,
    },
    {
      id: 'prod_003',
      name: 'Jowar (Sorghum)',
      subtitle: 'Gluten-free heritage grain',
      price: 380,
      rating: 4.3,
      reviews: 18,
    },
    {
      id: 'prod_004',
      name: 'Ragi (Finger Millet)',
      subtitle: 'Calcium-rich superfood',
      price: 400,
      rating: 4.6,
      reviews: 32,
    },
  ]);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setLoading(true);
    setError(null);
    
    // Simulate API call
    setTimeout(() => {
      setLoading(false);
    }, 500);
  };

  const handleClearSearch = () => {
    setSearchQuery('');
    setError(null);
  };

  const handleAddToCart = (product: any) => {
    console.log('Added to cart:', product);
    // TODO: Dispatch cart action
  };

  const filteredProducts = products.filter(p =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.subtitle.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <>
      <Header cartCount={0} isAuthenticated={false} />

      <main className="min-h-screen bg-gray-50">
        {/* Search Section */}
        <section className="bg-white border-b border-gray-200 py-6">
          <div className="container-max">
            <h1 className="text-3xl md:text-4xl font-bold mb-6 text-gray-900">
              Browse Our Grains
            </h1>
            <SearchBar
              placeholder="Search grains..."
              onSearch={handleSearch}
              onClear={handleClearSearch}
              loading={loading}
              value={searchQuery}
            />
          </div>
        </section>

        {/* Products Grid */}
        <section className="container-max py-12">
          {error && (
            <ErrorMessage
              message={error}
              onRetry={() => handleSearch(searchQuery)}
              dismissible
            />
          )}

          {loading ? (
            <LoadingSpinner message="Searching products..." />
          ) : filteredProducts.length === 0 ? (
            <EmptyState
              icon="🔍"
              title="No Products Found"
              message={
                searchQuery
                  ? `No products match "${searchQuery}". Try a different search.`
                  : 'No products available. Check back soon!'
              }
              action={
                searchQuery
                  ? { label: 'Clear Search', href: '/products' }
                  : undefined
              }
            />
          ) : (
            <>
              <p className="text-gray-600 mb-6">
                Showing {filteredProducts.length} product
                {filteredProducts.length !== 1 ? 's' : ''}
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {filteredProducts.map((product, index) => (
                  <div
                    key={product.id}
                    style={{
                      animationDelay: `${index * 50}ms`,
                    }}
                  >
                    <ProductCard
                      product={product}
                      onAddToCart={handleAddToCart}
                    />
                  </div>
                ))}
              </div>
            </>
          )}
        </section>
      </main>

      <Footer />
    </>
  );
}
