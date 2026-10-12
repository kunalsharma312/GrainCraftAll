/**
 * Validation Service
 * Handles all validation for forms, data, and business logic
 */

export class ValidationError extends Error {
  public field?: string;

  constructor(message: string, field?: string) {
    super(message);
    this.field = field;
    this.name = 'ValidationError';
  }
}

class ValidationService {
  /**
   * Validate email format
   */
  validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Validate phone number
   */
  validatePhone(phone: string): boolean {
    const phoneRegex = /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/;
    return phoneRegex.test(phone.replace(/\s/g, ''));
  }

  /**
   * Validate pincode
   */
  validatePincode(pincode: string): boolean {
    // US ZIP code format (5 or 9 digits)
    const pincodeRegex = /^\d{5}(-\d{4})?$/;
    return pincodeRegex.test(pincode);
  }

  /**
   * Validate address
   */
  validateAddress(address: {
    fullName?: string;
    phone?: string;
    houseNumber?: string;
    street?: string;
    pincode?: string;
    city?: string;
    state?: string;
  }): { valid: boolean; errors: Record<string, string> } {
    const errors: Record<string, string> = {};

    if (!address.fullName || address.fullName.trim().length < 2) {
      errors.fullName = 'Full name is required (min 2 characters)';
    }

    if (!address.phone || !this.validatePhone(address.phone)) {
      errors.phone = 'Valid phone number is required';
    }

    if (!address.houseNumber || address.houseNumber.trim().length === 0) {
      errors.houseNumber = 'House number is required';
    }

    if (!address.street || address.street.trim().length < 3) {
      errors.street = 'Street address is required (min 3 characters)';
    }

    if (!address.pincode || !this.validatePincode(address.pincode)) {
      errors.pincode = 'Valid pincode is required (ZIP format)';
    }

    if (!address.city || address.city.trim().length < 2) {
      errors.city = 'City is required';
    }

    if (!address.state || address.state.trim().length < 2) {
      errors.state = 'State is required';
    }

    return {
      valid: Object.keys(errors).length === 0,
      errors,
    };
  }

  /**
   * Validate product quantity
   */
  validateQuantity(quantity: number, maxQuantity?: number): boolean {
    if (quantity <= 0 || !Number.isInteger(quantity)) {
      return false;
    }
    if (maxQuantity && quantity > maxQuantity) {
      return false;
    }
    return true;
  }

  /**
   * Validate price
   */
  validatePrice(price: number): boolean {
    return price > 0 && Number.isFinite(price);
  }

  /**
   * Validate cart items
   */
  validateCartItems(items: any[]): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!Array.isArray(items)) {
      errors.push('Cart items must be an array');
      return { valid: false, errors };
    }

    if (items.length === 0) {
      errors.push('Cart cannot be empty');
      return { valid: false, errors };
    }

    items.forEach((item, index) => {
      if (!item.id) {
        errors.push(`Item ${index + 1}: Missing ID`);
      }
      if (!item.name) {
        errors.push(`Item ${index + 1}: Missing name`);
      }
      if (!this.validatePrice(item.price)) {
        errors.push(`Item ${index + 1}: Invalid price`);
      }
      if (!this.validateQuantity(item.quantity)) {
        errors.push(`Item ${index + 1}: Invalid quantity`);
      }
    });

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  /**
   * Sanitize input string
   */
  sanitizeString(input: string, maxLength: number = 255): string {
    return input
      .trim()
      .substring(0, maxLength)
      .replace(/[<>]/g, '');
  }

  /**
   * Validate blend ingredients
   */
  validateBlendIngredients(
    ingredients: Array<{ id: string; percentage: number }>
  ): { valid: boolean; errors: string[] } {
    const errors: string[] = [];
    let totalPercentage = 0;

    if (!Array.isArray(ingredients) || ingredients.length === 0) {
      errors.push('At least one ingredient is required');
      return { valid: false, errors };
    }

    ingredients.forEach((ingredient, index) => {
      if (!ingredient.id) {
        errors.push(`Ingredient ${index + 1}: Missing ID`);
      }
      if (!Number.isFinite(ingredient.percentage) || ingredient.percentage < 0 || ingredient.percentage > 100) {
        errors.push(`Ingredient ${index + 1}: Percentage must be between 0 and 100`);
      } else {
        totalPercentage += ingredient.percentage;
      }
    });

    if (totalPercentage !== 100) {
      errors.push(`Blend percentages must total 100% (currently ${totalPercentage.toFixed(1)}%)`);
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  /**
   * Validate order request
   */
  validateOrderRequest(orderRequest: {
    items?: any[];
    addressId?: string;
  }): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    const itemsValidation = this.validateCartItems(orderRequest.items || []);
    if (!itemsValidation.valid) {
      errors.push(...itemsValidation.errors);
    }

    if (!orderRequest.addressId || orderRequest.addressId.trim().length === 0) {
      errors.push('Delivery address ID is required');
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }
}

export const validationService = new ValidationService();
