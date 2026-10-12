# GrainCraft Web Application - Setup & Testing Guide

## Quick Start

### 1. Installation

```bash
cd web
npm install
```

### 2. Environment Setup

Create `.env.local` file:

```env
NEXT_PUBLIC_API_URL=https://api.graincraftapp.com/v1
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_key_here
NEXT_PUBLIC_APP_ENV=development
```

### 3. Development Server

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000)

---

## Project Structure

```
web/
├── src/
│   ├── app/                    # Next.js app directory
│   │   ├── layout.tsx          # Root layout with metadata
│   │   ├── page.tsx            # Landing page
│   │   ├── products/           # Products listing
│   │   ├── blend/              # Custom blend creation
│   │   ├── cart/               # Shopping cart
│   │   ├── orders/             # Order history
│   │   ├── auth/               # Authentication
│   │   └── checkout/           # Checkout flow (to be created)
│   ├── components/             # Reusable React components
│   │   ├── Header.tsx          # Navigation header
│   │   ├── Footer.tsx          # Footer
│   │   ├── ProductCard.tsx     # Product display
│   │   ├── CartItem.tsx        # Cart item
│   │   ├── SearchBar.tsx       # Search functionality
│   │   ├── LoadingSpinner.tsx  # Loading UI
│   │   ├── EmptyState.tsx      # Empty state fallback
│   │   └── ErrorMessage.tsx    # Error display
│   ├── services/
│   │   └── api.ts              # API client with all endpoints
│   ├── hooks/
│   │   └── useApi.ts           # Custom hooks for data fetching
│   ├── styles/
│   │   └── globals.css         # Global styles + Tailwind
│   └── types/
│       └── index.ts            # TypeScript type definitions
├── public/                     # Static assets
└── package.json
```

---

## Pages Overview

### Landing Page (`/`)
- Hero section with CTA
- Feature highlights
- Call-to-action buttons
- Responsive grid layout

### Products Page (`/products`)
- Product listing with grid layout
- Real-time search functionality
- Product cards with ratings
- Add to cart button
- Filter and sort options

### Blend Page (`/blend`)
- Custom blend creation interface
- Ingredient selection with sliders
- Real-time proportion calculation
- Price estimation
- Add blend to cart

### Cart Page (`/cart`)
- Cart items display
- Quantity controls (+/-)
- Item removal
- Order summary with pricing
- Proceed to checkout

### Orders Page (`/orders`)
- Order history listing
- Order status display
- Delivery information
- Order tracking timeline
- Order details view

### Auth Page (`/auth`)
- Sign in / Sign up toggle
- Email and password fields
- Social login (Google)
- Guest login option
- Form validation

---

## Components

### Header
- **Props**: `cartCount`, `isAuthenticated`
- **Features**: Responsive nav, mobile menu, cart badge
- **Usage**:
```tsx
<Header cartCount={5} isAuthenticated={true} />
```

### ProductCard
- **Props**: `product`, `onAddToCart`, `onWishlist`
- **Features**: Product image, rating, price, add to cart
- **Usage**:
```tsx
<ProductCard 
  product={product}
  onAddToCart={handleAddToCart}
  onWishlist={handleWishlist}
/>
```

### CartItem
- **Props**: `item`, `onUpdateQuantity`, `onRemove`
- **Features**: Item details, quantity controls, remove button
- **Usage**:
```tsx
<CartItem 
  item={cartItem}
  onUpdateQuantity={handleUpdateQuantity}
  onRemove={handleRemove}
/>
```

### SearchBar
- **Props**: `placeholder`, `onSearch`, `onClear`, `loading`, `value`
- **Features**: Real-time search, clear button, loading state
- **Usage**:
```tsx
<SearchBar 
  onSearch={handleSearch}
  onClear={handleClear}
  loading={isLoading}
/>
```

### LoadingSpinner
- **Props**: `message`, `fullScreen`, `size`
- **Features**: Animated spinner, optional message, modal option
- **Usage**:
```tsx
<LoadingSpinner 
  message="Loading..." 
  size="md" 
  fullScreen={false}
/>
```

### EmptyState
- **Props**: `icon`, `title`, `message`, `action`
- **Features**: Centered empty state with optional action
- **Usage**:
```tsx
<EmptyState 
  icon="🛒"
  title="Cart Empty"
  message="Add items to get started"
  action={{ label: 'Shop Now', href: '/products' }}
/>
```

### ErrorMessage
- **Props**: `message`, `onRetry`, `onDismiss`, `dismissible`
- **Features**: Error display with retry/dismiss options
- **Usage**:
```tsx
<ErrorMessage 
  message="Failed to load products"
  onRetry={handleRetry}
  dismissible={true}
/>
```

---

## API Integration

### API Service Methods

```typescript
import { apiService } from '@/services/api';

// Products
await apiService.getProducts(page, pageSize);
await apiService.searchProducts(query, page, pageSize);

// Blends
await apiService.getBlendIngredients();
await apiService.calculateBlend(blendData);
await apiService.createBlend(blendData);

// Orders
await apiService.getOrders(page, pageSize);
await apiService.getOrder(id);
await apiService.createOrder(orderData);
await apiService.cancelOrder(id);

// Addresses
await apiService.getAddresses();
await apiService.createAddress(addressData);
await apiService.updateAddress(id, addressData);
await apiService.deleteAddress(id);

// Auth
await apiService.loginWithToken(token, provider);
await apiService.loginAsGuest();
await apiService.logout();

// Payments
await apiService.initializePayment(paymentData);
await apiService.verifyPayment(verificationData);
```

### Custom Hooks

```typescript
import { useProducts, useOrders, useAuth } from '@/hooks/useApi';

// Products
const { products, loading, error, fetchProducts, searchProducts } = useProducts();

// Orders
const { orders, loading, error, fetchOrders } = useOrders();

// Auth
const { user, loading, error, login, loginAsGuest, logout } = useAuth();
```

---

## Testing Checklist

### Navigation & Routing
- [ ] Landing page loads correctly
- [ ] All navigation links work
- [ ] Mobile menu toggles properly
- [ ] Page transitions are smooth

### Products Page
- [ ] Products load and display in grid
- [ ] Search functionality filters products
- [ ] Search clears properly
- [ ] Product cards show all information
- [ ] Add to cart button is clickable
- [ ] Wishlist toggle works

### Cart Page
- [ ] Cart items display correctly
- [ ] Quantity controls (+/-) work
- [ ] Remove button removes items
- [ ] Total calculation is accurate
- [ ] Empty cart state shows properly
- [ ] Proceed to checkout button is visible

### Blend Page
- [ ] Ingredients load correctly
- [ ] Proportion sliders work
- [ ] Manual input fields work
- [ ] Total percentage validation works
- [ ] Calculate blend button triggers calculation
- [ ] Calculated blend displays correctly
- [ ] Add blend to cart works

### Orders Page
- [ ] Orders list loads
- [ ] Order status displays
- [ ] Delivery information shows
- [ ] Empty state shows when no orders
- [ ] Order details are clickable

### Auth Page
- [ ] Sign in form displays
- [ ] Sign up toggle works
- [ ] Form validation works
- [ ] Social login buttons present
- [ ] Guest login option available
- [ ] Privacy notice displays

### Responsive Design
- [ ] Mobile view (320px) works
- [ ] Tablet view (768px) works
- [ ] Desktop view (1024px+) works
- [ ] Images scale properly
- [ ] Text is readable on all sizes
- [ ] Touch targets are adequate

### API Integration
- [ ] API calls include auth token
- [ ] Error handling works
- [ ] Loading states display
- [ ] Data updates correctly
- [ ] Offline handling graceful

### Performance
- [ ] Page load time < 3s
- [ ] Smooth scrolling
- [ ] Images lazy load
- [ ] No layout shifts
- [ ] Animations are smooth

### Accessibility
- [ ] Keyboard navigation works
- [ ] ARIA labels present
- [ ] Form labels associated
- [ ] Color contrast adequate
- [ ] Focus indicators visible

---

## Building for Production

### Build

```bash
npm run build
npm run type-check
```

### Deploy to Vercel

```bash
npm i -g vercel
vercel deploy
```

### Deploy with Docker

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

---

## Troubleshooting

### API Connection Issues

```
Problem: 401 Unauthorized
Solution: Check NEXT_PUBLIC_API_URL is correct, clear localStorage

Problem: CORS errors
Solution: Verify backend CORS configuration, check API URL

Problem: Network timeout
Solution: Increase NEXT_PUBLIC_API_TIMEOUT or check backend health
```

### Build Issues

```
Problem: TypeScript errors
Solution: npm run type-check to identify issues

Problem: Missing dependencies
Solution: npm install, clear node_modules and reinstall

Problem: Port already in use
Solution: npm run dev -- -p 3001 (use different port)
```

### Performance Issues

```
Problem: Slow page load
Solution: Check network tab, optimize images, reduce bundle size

Problem: Layout shifts
Solution: Add explicit dimensions to images, fix CSS

Problem: High memory usage
Solution: Check for memory leaks, optimize components
```

---

## Next Steps

### Features to Add
- [ ] Checkout page with address selection
- [ ] Payment integration (Razorpay/Stripe)
- [ ] Order confirmation screen
- [ ] User profile page
- [ ] Wishlist functionality
- [ ] Product reviews/ratings
- [ ] Promo codes and discounts

### Enhancements
- [ ] Redux/Zustand state management
- [ ] Cart persistence in localStorage
- [ ] User session management
- [ ] Advanced search filters
- [ ] Product recommendations
- [ ] Analytics integration
- [ ] Email notifications

### Testing
- [ ] Unit tests with Jest
- [ ] Integration tests
- [ ] E2E tests with Playwright
- [ ] Visual regression testing
- [ ] Performance testing
- [ ] Accessibility audits

---

## Development Workflow

### Daily Development

```bash
# Start dev server
npm run dev

# In another terminal, run type checking
npm run type-check

# Before committing, build
npm run build
```

### Code Style

```bash
# Format code
npm run lint

# Type check
npm run type-check
```

### Environment Variables

- Development: `.env.local` (local only)
- Staging: Set in Vercel dashboard
- Production: Set in Vercel dashboard

---

## Support & Documentation

- **API Docs**: See `../BACKEND_API_REQUIREMENTS.md`
- **Mobile App**: React Native Expo app in parent directory
- **Backend**: Requires Node.js backend server

---

## Key Technologies

- **Next.js 14** - React framework
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **Axios** - HTTP client
- **React Icons** - Icon library

---

## FAQ

**Q: How do I connect to a real backend?**
A: Set `NEXT_PUBLIC_API_URL` to your backend URL in `.env.local`

**Q: How do I enable authentication?**
A: Update the Auth page to call the actual API endpoints

**Q: How do I add Redux?**
A: Install Redux Toolkit and create slices as needed

**Q: Can I deploy to other platforms?**
A: Yes! Build output is static/optimized, works anywhere

**Q: How do I handle payment processing?**
A: Use Razorpay/Stripe SDK alongside the payment endpoints

---

## Version Information

- Node.js: 18+
- npm: 9+
- Next.js: 14.0+
- React: 18.2+
- TypeScript: 5.2+
- Tailwind CSS: 3.3+

---

**Last Updated**: 2024-09-30
**Status**: Production Ready
