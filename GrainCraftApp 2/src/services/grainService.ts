/**
 * Grain Service
 * Fetches and filters grain details by location
 * Works with Google Sheets API returning array of grain objects
 * Handles city/state name variations (case, spaces, etc.)
 */

export interface Grain {
  id: string;
  grain: string;
  price: number | string;
  discount: number | string;
  delivery_charge: number | string;
  city: string;
  state: string;
  unit?: 'kg' | 'g'; // kg or grams (default: kg)
}

export interface GrainResponse {
  grains: Grain[];
  total: number;
  city?: string;
  state?: string;
}

class GrainService {
  /**
   * Normalize city/state name for comparison
   * Converts to lowercase and removes extra spaces
   */
  private normalizeName(name: string): string {
    return name
      .toLowerCase()
      .trim()
      .replace(/\s+/g, ' '); // Convert multiple spaces to single space
  }

  /**
   * Get exact match or fuzzy match for city names
   */
  private matchCityName(grainCity: string, userCity: string): boolean {
    const normalized1 = this.normalizeName(grainCity);
    const normalized2 = this.normalizeName(userCity);

    // Exact match
    if (normalized1 === normalized2) {
      return true;
    }

    // Partial match (grain city contains user city or vice versa)
    if (normalized1.includes(normalized2) || normalized2.includes(normalized1)) {
      return true;
    }

    return false;
  }

  /**
   * Get list of unique cities from grains (normalized)
   */
  getUniqueCities(grains: Grain[]): string[] {
    const cities = new Set<string>();
    grains.forEach(grain => {
      if (grain.city) {
        cities.add(this.normalizeName(grain.city));
      }
    });
    return Array.from(cities).sort();
  }

  /**
   * Get list of unique states from grains (normalized)
   */
  getUniqueStates(grains: Grain[]): string[] {
    const states = new Set<string>();
    grains.forEach(grain => {
      if (grain.state) {
        states.add(this.normalizeName(grain.state));
      }
    });
    return Array.from(states).sort();
  }

  /**
   * Fetch grains from Google Sheets API endpoint
   */
  async fetchGrainsFromAPI(apiUrl: string): Promise<Grain[]> {
    try {
      const response = await fetch(apiUrl);
      
      if (!response.ok) {
        throw new Error(`API Error: ${response.status}`);
      }

      const text = await response.text();
      const data = JSON.parse(text);
      
      // Google Apps Script returns array directly
      return Array.isArray(data) ? data : [];
    } catch (error) {
      console.error('Error fetching grains from API:', error);
      return [];
    }
  }

  /**
   * Filter grains by city (handles variations)
   */
  filterByCity(grains: Grain[], city: string): Grain[] {
    if (!city || city.trim().length === 0) {
      return grains;
    }

    return grains.filter(grain => this.matchCityName(grain.city, city));
  }

  /**
   * Filter grains by state (handles variations)
   */
  filterByState(grains: Grain[], state: string): Grain[] {
    if (!state || state.trim().length === 0) {
      return grains;
    }

    return grains.filter(
      grain => grain.state && this.normalizeName(grain.state) === this.normalizeName(state)
    );
  }

  /**
   * Filter grains by city and state
   */
  filterByLocation(grains: Grain[], city: string, state?: string): Grain[] {
    let filtered = grains;

    if (city) {
      filtered = this.filterByCity(filtered, city);
    }

    if (state) {
      filtered = this.filterByState(filtered, state);
    }

    return filtered;
  }

  /**
   * Search grains by name (handles case variations)
   */
  searchGrains(grains: Grain[], query: string): Grain[] {
    if (!query || query.trim().length === 0) {
      return grains;
    }

    const lowerQuery = this.normalizeName(query);
    return grains.filter(
      grain => grain.grain && this.normalizeName(grain.grain).includes(lowerQuery)
    );
  }

  /**
   * Get price range from grains
   */
  getPriceRange(grains: Grain[]): { min: number; max: number } {
    if (grains.length === 0) {
      return { min: 0, max: 0 };
    }

    const prices = grains
      .map(g => parseInt(g.price as string) || 0)
      .filter(p => p > 0);
    
    if (prices.length === 0) {
      return { min: 0, max: 0 };
    }

    return {
      min: Math.min(...prices),
      max: Math.max(...prices),
    };
  }

  /**
   * Get average price
   */
  getAveragePrice(grains: Grain[]): number {
    if (grains.length === 0) return 0;
    
    const total = grains.reduce((sum, g) => sum + (parseInt(g.price as string) || 0), 0);
    return Math.round(total / grains.length);
  }

  /**
   * Apply discount to price
   */
  getPriceAfterDiscount(grain: Grain): number {
    const price = parseInt(grain.price as string) || 0;
    const discount = parseInt(grain.discount as string) || 0;
    return Math.round(price - (price * discount / 100));
  }

  /**
   * Calculate final price with delivery
   */
  getFinalPrice(grain: Grain): number {
    const priceAfterDiscount = this.getPriceAfterDiscount(grain);
    const delivery = parseInt(grain.delivery_charge as string) || 0;
    return priceAfterDiscount + delivery;
  }

  /**
   * Sort grains by price
   */
  sortByPrice(grains: Grain[], ascending: boolean = true): Grain[] {
    return [...grains].sort((a, b) => {
      const priceA = this.getFinalPrice(a);
      const priceB = this.getFinalPrice(b);
      return ascending ? priceA - priceB : priceB - priceA;
    });
  }

  /**
   * Get grains stats
   */
  getStats(grains: Grain[]) {
    const priceRange = this.getPriceRange(grains);
    const avgPrice = this.getAveragePrice(grains);
    const avgDiscount = Math.round(
      grains.reduce((sum, g) => sum + (parseInt(g.discount as string) || 0), 0) / grains.length
    );

    const cities = this.getUniqueCities(grains);
    const states = this.getUniqueStates(grains);

    return {
      totalGrains: grains.length,
      priceRange,
      avgPrice,
      avgDiscount,
      citiesCount: cities.length,
      statesCount: states.length,
      cities,
      states,
    };
  }

  /**
   * Find best matching city from available cities
   */
  findBestMatchingCity(userCity: string, availableCities: string[]): string | null {
    if (!userCity || availableCities.length === 0) {
      return null;
    }

    const normalized = this.normalizeName(userCity);

    // Exact match first
    const exactMatch = availableCities.find(
      city => this.normalizeName(city) === normalized
    );
    if (exactMatch) {
      return exactMatch;
    }

    // Partial match
    const partialMatch = availableCities.find(
      city => this.normalizeName(city).includes(normalized) || normalized.includes(this.normalizeName(city))
    );
    if (partialMatch) {
      return partialMatch;
    }

    return null;
  }

  /**
   * Find best matching state
   */
  findBestMatchingState(userState: string, availableStates: string[]): string | null {
    if (!userState || availableStates.length === 0) {
      return null;
    }

    const normalized = this.normalizeName(userState);

    // Exact match
    const exactMatch = availableStates.find(
      state => this.normalizeName(state) === normalized
    );
    if (exactMatch) {
      return exactMatch;
    }

    // Partial match
    const partialMatch = availableStates.find(
      state => this.normalizeName(state).includes(normalized) || normalized.includes(this.normalizeName(state))
    );
    if (partialMatch) {
      return partialMatch;
    }

    return null;
  }
}

// Export singleton instance
export const grainService = new GrainService();

export default grainService;
