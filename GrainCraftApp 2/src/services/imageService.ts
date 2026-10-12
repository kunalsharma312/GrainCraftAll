/**
 * Image Service
 * Manages grain images based on type/category with fallbacks
 */

export interface GrainImageConfig {
  type: string;
  imageUrl: string;
  alt: string;
}

class ImageService {
  /**
   * Image mapping by grain type/category
   * Maps grain names to their image paths
   */
  private imageMap: Record<string, string> = {
    // Wheat varieties
    'sharbati atta': '/assets/images/grains/wheat-sharbati.png',
    'lokwan wheat': '/assets/images/grains/wheat-lokwan.png',
    'punjab wheat': '/assets/images/grains/wheat-punjab.png',
    'desi wheat': '/assets/images/grains/wheat-desi.png',
    'up wheat': '/assets/images/grains/wheat-up.png',
    'khapli': '/assets/images/grains/wheat-khapli.png',
    'emmer': '/assets/images/grains/wheat-khapli.png',

    // Millets
    'bajra': '/assets/images/grains/millet-bajra.png',
    'pearl millet': '/assets/images/grains/millet-bajra.png',
    'jowar': '/assets/images/grains/millet-jowar.png',
    'sorghum': '/assets/images/grains/millet-jowar.png',
    'ragi': '/assets/images/grains/millet-ragi.png',
    'finger millet': '/assets/images/grains/millet-ragi.png',

    // Flours & Special
    'multigrain': '/assets/images/grains/flour-multigrain.png',
    'besan': '/assets/images/grains/flour-besan.png',
    'gram flour': '/assets/images/grains/flour-besan.png',
    'rice flour': '/assets/images/grains/flour-rice.png',
    'makki': '/assets/images/grains/flour-makki.png',
    'sooji': '/assets/images/grains/flour-sooji.png',
    'semolina': '/assets/images/grains/flour-sooji.png',
    'kuttu': '/assets/images/grains/flour-kuttu.png',
    'buckwheat': '/assets/images/grains/flour-kuttu.png',
  };

  /**
   * Get category from grain name
   */
  private getCategoryFromName(grainName: string): string {
    const normalized = grainName.toLowerCase().trim();

    if (normalized.includes('wheat') || normalized.includes('atta')) {
      return 'wheat';
    }
    if (normalized.includes('bajra') || normalized.includes('pearl millet')) {
      return 'millet';
    }
    if (normalized.includes('jowar') || normalized.includes('sorghum')) {
      return 'millet';
    }
    if (normalized.includes('ragi') || normalized.includes('finger millet')) {
      return 'millet';
    }
    if (
      normalized.includes('besan') ||
      normalized.includes('gram') ||
      normalized.includes('flour')
    ) {
      return 'flour';
    }

    return 'grain'; // Default category
  }

  /**
   * Get image URL for a grain
   */
  getImageUrl(grainName: string): string {
    const normalized = grainName.toLowerCase().trim();

    // Check for direct match
    if (this.imageMap[normalized]) {
      return this.imageMap[normalized];
    }

    // Check for partial match
    for (const [key, url] of Object.entries(this.imageMap)) {
      if (normalized.includes(key) || key.includes(normalized)) {
        return url;
      }
    }

    // Return category default
    const category = this.getCategoryFromName(grainName);
    return `/assets/images/grains/${category}-default.png`;
  }

  /**
   * Get alt text for image
   */
  getAltText(grainName: string): string {
    return `${grainName} grain image`;
  }

  /**
   * Get all available grain types
   */
  getAvailableGrainTypes(): string[] {
    return Array.from(new Set(Object.keys(this.imageMap))).sort();
  }

  /**
   * Check if image exists (for validation)
   */
  imageExists(grainName: string): boolean {
    const normalized = grainName.toLowerCase().trim();
    return this.imageMap.hasOwnProperty(normalized);
  }

  /**
   * Get category icon/emoji
   */
  getCategoryIcon(grainName: string): string {
    const category = this.getCategoryFromName(grainName);

    const icons: Record<string, string> = {
      wheat: '🌾',
      millet: '🌽',
      flour: '🌬️',
      grain: '🍚',
    };

    return icons[category] || '🍞';
  }

  /**
   * Get category name
   */
  getCategoryName(grainName: string): string {
    const category = this.getCategoryFromName(grainName);
    const names: Record<string, string> = {
      wheat: 'Wheat',
      millet: 'Millet',
      flour: 'Flour',
      grain: 'Grain',
    };

    return names[category] || 'Grain';
  }

  /**
   * Get color for category
   */
  getCategoryColor(grainName: string): string {
    const category = this.getCategoryFromName(grainName);

    const colors: Record<string, string> = {
      wheat: '#D4A574',    // Wheat brown
      millet: '#F4D03F',   // Millet yellow
      flour: '#E8D7C3',    // Flour cream
      grain: '#8B7355',    // Grain brown
    };

    return colors[category] || '#D4AF37';
  }

  /**
   * Get image config with all metadata
   */
  getImageConfig(grainName: string): GrainImageConfig {
    return {
      type: this.getCategoryName(grainName),
      imageUrl: this.getImageUrl(grainName),
      alt: this.getAltText(grainName),
    };
  }

  /**
   * Add custom grain image mapping
   */
  addImageMapping(grainName: string, imageUrl: string): void {
    this.imageMap[grainName.toLowerCase().trim()] = imageUrl;
  }

  /**
   * Get image paths by category
   */
  getImagesByCategory(category: string): Record<string, string> {
    const normalized = category.toLowerCase();
    const result: Record<string, string> = {};

    for (const [grain, url] of Object.entries(this.imageMap)) {
      if (grain.includes(normalized) || this.getCategoryFromName(grain) === normalized) {
        result[grain] = url;
      }
    }

    return result;
  }

  /**
   * Generate image HTML tag
   */
  getImageHtml(grainName: string, width: number = 100, height: number = 100): string {
    const url = this.getImageUrl(grainName);
    const alt = this.getAltText(grainName);
    const category = this.getCategoryName(grainName);

    return `<img 
      src="${url}" 
      alt="${alt}"
      title="${category}"
      width="${width}" 
      height="${height}" 
      style="border-radius: 8px; object-fit: cover;"
      onerror="this.src='/assets/images/grains/grain-default.png'"
    />`;
  }

  /**
   * Get category badge HTML
   */
  getCategoryBadge(grainName: string): string {
    const icon = this.getCategoryIcon(grainName);
    const category = this.getCategoryName(grainName);
    const color = this.getCategoryColor(grainName);

    return `<span 
      style="
        display: inline-block;
        background: ${color};
        color: white;
        padding: 4px 8px;
        border-radius: 4px;
        font-size: 12px;
        font-weight: 600;
        white-space: nowrap;
      "
    >
      ${icon} ${category}
    </span>`;
  }
}

// Export singleton instance
export const imageService = new ImageService();

export default imageService;
