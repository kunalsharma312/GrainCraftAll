'use client';

import { useState } from 'react';
import { Header, Footer, LoadingSpinner } from '@/components';
import { FiPlus, FiMinus } from 'react-icons/fi';

export default function BlendPage() {
  // Mock ingredients - will be replaced with API call
  const [ingredients] = useState([
    { id: 'ing_001', name: 'Organic Wheat', basePrice: 400 },
    { id: 'ing_002', name: 'Basmati Rice', basePrice: 300 },
    { id: 'ing_003', name: 'Jowar (Sorghum)', basePrice: 350 },
    { id: 'ing_004', name: 'Ragi (Finger Millet)', basePrice: 380 },
  ]);

  const [proportions, setProportions] = useState<Record<string, number>>({});
  const [calculatedBlend, setCalculatedBlend] = useState<any>(null);

  const handleProportionChange = (ingredientId: string, value: number) => {
    setProportions(prev => ({
      ...prev,
      [ingredientId]: Math.max(0, Math.min(100, value)),
    }));
  };

  const totalPercentage = Object.values(proportions).reduce((a, b) => a + b, 0);

  const handleCalculateBlend = () => {
    if (totalPercentage !== 100) {
      alert('Proportions must total exactly 100%');
      return;
    }

    const blendIngredients = ingredients
      .map(ing => ({
        ...ing,
        percentage: proportions[ing.id] || 0,
      }))
      .filter(ing => ing.percentage > 0);

    const blendName = blendIngredients.slice(0, 2).map(ing => ing.name.split(' ')[0]).join(' & ') + ' Blend';
    const totalPrice = blendIngredients.reduce(
      (sum, ing) => sum + (ing.basePrice * ing.percentage / 100),
      0
    );

    setCalculatedBlend({
      name: blendName,
      ingredients: blendIngredients,
      totalPrice,
    });
  };

  const handleAddToCart = () => {
    if (!calculatedBlend) return;
    console.log('Added blend to cart:', calculatedBlend);
    // TODO: Dispatch cart action
  };

  // Initialize proportions equally
  if (Object.keys(proportions).length === 0 && ingredients.length > 0) {
    const equal = 100 / ingredients.length;
    const initial: Record<string, number> = {};
    ingredients.forEach(ing => {
      initial[ing.id] = Math.round(equal * 100) / 100;
    });
    setProportions(initial);
  }

  return (
    <>
      <Header cartCount={0} isAuthenticated={false} />

      <main className="min-h-screen bg-gray-50">
        <div className="container-max py-12">
          <div className="max-w-2xl mx-auto">
            <h1 className="text-3xl md:text-4xl font-bold mb-4 text-gray-900">
              Create Your Custom Blend
            </h1>
            <p className="text-gray-600 mb-8">
              Select heritage grains and adjust proportions to create your perfect blend.
              Proportions must total exactly 100%.
            </p>

            {/* Ingredients Form */}
            <div className="card p-6 md:p-8 mb-8">
              <h2 className="text-xl font-bold mb-6 text-gray-900">
                Select Ingredients
              </h2>

              <div className="space-y-6">
                {ingredients.map(ingredient => (
                  <div key={ingredient.id} className="border-b border-gray-200 pb-6 last:border-b-0">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h3 className="font-semibold text-gray-900">
                          {ingredient.name}
                        </h3>
                        <p className="text-sm text-gray-600">
                          ₹{ingredient.basePrice}/unit
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-primary">
                          {Math.round(proportions[ingredient.id] || 0)}%
                        </p>
                      </div>
                    </div>

                    {/* Proportion Input */}
                    <div className="flex items-center gap-4">
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={proportions[ingredient.id] || 0}
                        onChange={e =>
                          handleProportionChange(ingredient.id, parseFloat(e.target.value))
                        }
                        className="flex-1"
                      />
                      <div className="flex items-center gap-2 bg-gray-100 rounded-lg p-1 w-24">
                        <button
                          onClick={() =>
                            handleProportionChange(
                              ingredient.id,
                              Math.max(0, (proportions[ingredient.id] || 0) - 5)
                            )
                          }
                          className="p-1 hover:bg-white rounded transition"
                        >
                          <FiMinus size={16} />
                        </button>
                        <span className="flex-1 text-center font-semibold text-sm">
                          {Math.round(proportions[ingredient.id] || 0)}
                        </span>
                        <button
                          onClick={() =>
                            handleProportionChange(
                              ingredient.id,
                              Math.min(100, (proportions[ingredient.id] || 0) + 5)
                            )
                          }
                          className="p-1 hover:bg-white rounded transition"
                        >
                          <FiPlus size={16} />
                        </button>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="mt-2 h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary transition-all duration-200"
                        style={{
                          width: `${proportions[ingredient.id] || 0}%`,
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>

              {/* Total Percentage */}
              <div className="mt-8 pt-6 border-t-2 border-gray-200">
                <div className="flex justify-between items-center">
                  <span className="font-semibold text-lg text-gray-900">
                    Total Proportion
                  </span>
                  <span
                    className={`text-2xl font-bold ${
                      totalPercentage === 100 ? 'text-success' : 'text-error'
                    }`}
                  >
                    {Math.round(totalPercentage)}%
                  </span>
                </div>
              </div>

              <button
                onClick={handleCalculateBlend}
                disabled={totalPercentage !== 100}
                className="btn-primary w-full py-3 mt-6 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Calculate Blend
              </button>
            </div>

            {/* Calculated Blend */}
            {calculatedBlend && (
              <div className="card p-6 md:p-8 animate-slideInUp">
                <h2 className="text-xl font-bold mb-4 text-gray-900">
                  Your Blend: {calculatedBlend.name}
                </h2>

                <div className="mb-6">
                  <p className="text-gray-600 mb-4">Composition:</p>
                  <div className="space-y-2">
                    {calculatedBlend.ingredients.map((ing: any) => (
                      <div key={ing.id} className="flex justify-between text-gray-900">
                        <span>{ing.name}</span>
                        <span className="font-semibold">{ing.percentage}%</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-gradient-to-r from-primary to-secondary rounded-lg p-4 mb-6 text-white">
                  <p className="text-sm opacity-90">Total Price</p>
                  <p className="text-3xl font-bold">
                    ₹{calculatedBlend.totalPrice.toFixed(2)}
                  </p>
                </div>

                <button
                  onClick={handleAddToCart}
                  className="btn-primary w-full py-3"
                >
                  Add to Cart
                </button>
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
}
