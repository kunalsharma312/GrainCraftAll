# GrainCraft Web Application

A modern Next.js web application for the GrainCraft e-commerce platform - premium heritage grains and custom blends.

## Quick Start

### Prerequisites
- Node.js 18+
- npm or yarn

### Installation

```bash
# Install dependencies
npm install
# or
yarn install
```

### Development

```bash
# Start development server
npm run dev
# or
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Build for Production

```bash
npm run build
npm start
```

## Project Structure

```
web/
├── src/
│   ├── app/              # Next.js app directory (routing)
│   ├── components/       # Reusable React components
│   ├── pages/           # Page components
│   ├── services/        # API and service layer
│   ├── hooks/           # Custom React hooks
│   ├── types/           # TypeScript type definitions
│   ├── utils/           # Utility functions
│   └── styles/          # Global and component styles
├── public/              # Static assets
├── package.json
├── next.config.js
├── tailwind.config.js
└── tsconfig.json
```

## Features

- ✅ Product browsing and search
- ✅ Custom grain blend creation
- ✅ Shopping cart management
- ✅ Checkout with multiple payment methods
- ✅ Order tracking and history
- ✅ User authentication
- ✅ Responsive design (mobile, tablet, desktop)
- ✅ Real-time updates
- ✅ Analytics integration
- ✅ Professional UI with animations

## Technology Stack

- **Framework**: Next.js 14 (React 18)
- **Styling**: Tailwind CSS
- **Icons**: React Icons
- **HTTP Client**: Axios
- **State Management**: Redux Toolkit / Zustand
- **Language**: TypeScript

## Environment Variables

Create a `.env.local` file (copy from `.env.example`):

```env
NEXT_PUBLIC_API_URL=https://api.graincraftapp.com/v1
NEXT_PUBLIC_RAZORPAY_KEY_ID=your_key_here
NEXT_PUBLIC_APP_ENV=production
```

## API Integration

The web app connects to the same backend as the mobile app. All API endpoints are shared:

- Products
- Blend ingredients & calculations
- Orders & checkout
- User management
- Payments
- Email notifications
- Analytics

See `../BACKEND_API_REQUIREMENTS.md` for full API documentation.

## Pages

### Public Pages
- `/` - Landing page
- `/products` - Browse all products
- `/blend` - Create custom blend
- `/auth` - Login/signup

### Protected Pages
- `/cart` - Shopping cart
- `/checkout` - Checkout process
- `/orders` - Order history
- `/profile` - User profile
- `/order/:id` - Order details

## Components

- `Header` - Navigation bar
- `Footer` - Footer with links
- `ProductCard` - Product display
- `CartItem` - Cart item display
- `PaymentForm` - Payment processing
- `OrderTimeline` - Delivery timeline
- `SearchBar` - Product search
- `FilterPanel` - Product filters

## Styling

Uses Tailwind CSS for utility-first styling with custom theme colors:

- Primary: `#8B7355` (Brown)
- Secondary: `#D4A574` (Tan)
- Success: `#4CAF50`
- Error: `#EF5350`

## Animations

Smooth animations using Tailwind CSS and CSS keyframes:

- `animate-fadeIn` - Fade in effect
- `animate-slideInUp` - Slide up effect
- `animate-slideInDown` - Slide down effect
- `animate-scaleIn` - Scale in effect

## Performance

- Optimized images with Next.js Image component
- Code splitting and lazy loading
- Caching strategies
- API response caching

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Deployment

### Vercel (Recommended)

```bash
vercel deploy
```

### Docker

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

### Environment Setup

Before deploying, set environment variables:

- `NEXT_PUBLIC_API_URL` - Backend API URL
- `NEXT_PUBLIC_RAZORPAY_KEY_ID` - Razorpay key
- `NEXT_PUBLIC_APP_ENV` - Environment (production/staging)

## Contributing

Contributions are welcome! Please follow the code style and commit guidelines.

## License

All rights reserved © 2024 GrainCraft

## Support

For issues or questions:
- Email: support@graincraftapp.com
- Issues: GitHub Issues
- Documentation: ./docs

---

**Note**: This is a Next.js-based web application. Mobile app is built with React Native (Expo).
Both share the same backend API and Redux state management patterns.
