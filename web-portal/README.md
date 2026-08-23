# Herbal Trace - Complete Herbal Traceability Solution

A modern React application built with Vite that provides complete traceability for herbal products from cultivation to final consumer. Built with security, performance, and user experience as top priorities.

## 🌿 Features

### Core Functionality
- **Complete Product Tracking** - Track herbs from seed to final product
- **Blockchain Security** - Immutable records using blockchain technology
- **QR Code Integration** - Quick product verification via QR codes
- **Real-time Updates** - Live tracking of product journey
- **Quality Assurance** - Lab results and certifications tracking

### Security Features
- **SQL Injection Prevention** - Input validation and sanitization
- **XSS Protection** - HTML sanitization using DOMPurify
- **Rate Limiting** - Protection against abuse and spam
- **Input Validation** - Comprehensive validation for all user inputs
- **CSRF Protection** - Cross-site request forgery prevention

### Technical Features
- **React 18** - Modern React with hooks and concurrent features
- **Vite** - Fast build tool and development server
- **Tailwind CSS** - Utility-first CSS framework
- **Framer Motion** - Smooth animations and transitions
- **Responsive Design** - Mobile-first approach
- **Performance Optimized** - Code splitting and lazy loading

## 🚀 Getting Started

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn

### Installation

1. Clone the repository
```bash
git clone https://github.com/your-username/herbal-trace.git
cd herbal-trace
```

2. Install dependencies
```bash
npm install
```

3. Start development server
```bash
npm run dev
```

4. Open your browser and navigate to `http://localhost:3000`

### Build for Production
```bash
npm run build
npm run preview
```

## 📁 Project Structure

```
src/
├── components/           # React components
│   ├── Navbar.jsx       # Navigation component
│   ├── HomePage.jsx     # Landing page
│   ├── TrackingPage.jsx # Product tracking
│   ├── ProcessPage.jsx  # Process information
│   ├── AboutPage.jsx    # About page
│   ├── ContactPage.jsx  # Contact form
│   └── Footer.jsx       # Footer component
├── services/            # API and business logic
│   └── api.js          # API service functions
├── utils/               # Utility functions
│   └── security.js     # Security utilities
├── assets/             # Static assets
├── App.jsx             # Main app component
├── main.jsx            # Entry point
└── index.css           # Global styles
```

## 🔒 Security Features

### Input Validation
All user inputs are validated and sanitized:
- **Tracking codes** - Format validation (HT-XXX-YYYY-NNN)
- **Email addresses** - RFC compliant validation
- **Names** - Letters, spaces, hyphens only
- **Messages** - Length limits and HTML sanitization

### Rate Limiting
Built-in protection against abuse:
- Tracking requests: 10 per 5 minutes
- Contact form: 3 submissions per 10 minutes
- Search requests: 20 per 5 minutes
- QR scans: 5 per 5 minutes

### XSS Prevention
- DOMPurify for HTML sanitization
- Input escaping
- Content Security Policy ready

## 📱 Sample Tracking Codes

Try these sample tracking codes in the application:
- `HT-TUR-2024-001` - Organic Turmeric Powder
- `HT-GIN-2024-002` - Organic Ginseng Root
- `HT-ASH-2024-003` - Ashwagandha Root Powder

## 🛠 Development

### Available Scripts
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

### Environment Setup
The application uses environment variables for configuration. Create a `.env` file:
```
VITE_API_BASE_URL=https://api.herbaltrace.com
VITE_BLOCKCHAIN_NETWORK=ethereum
```

## 🌟 Key Components

### TrackingPage
- Real-time product tracking
- QR code scanner integration
- Sample code testing
- Journey timeline visualization

### ProcessPage
- Six-stage tracking process
- Detailed stage descriptions
- Interactive timeline
- Benefits showcase

### ContactPage
- Secure contact form
- Input validation
- Rate limiting
- Success/error handling

## 🔧 Customization

### Styling
The application uses Tailwind CSS with custom configuration:
- Primary color: Green (herbs/nature theme)
- Accent color: Yellow (energy/sunshine)
- Custom animations and transitions
- Responsive breakpoints

### API Integration
Replace mock API functions in `src/services/api.js` with real endpoints:
```javascript
// Example real API integration
const trackProduct = async (code) => {
  const response = await fetch(`/api/track/${code}`)
  return response.json()
}
```

## 📊 Performance

### Optimizations
- Code splitting by route
- Lazy loading of components
- Image optimization
- Bundle size optimization
- Tree shaking

### Build Output
- Vendor chunks for libraries
- Separate router and animation bundles
- Minified and compressed assets
- Source maps for development

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details.

## 🌐 Deployment

### Vercel (Recommended)
```bash
npm run build
# Deploy dist/ folder to Vercel
```

### Netlify
```bash
npm run build
# Deploy dist/ folder to Netlify
```

### Docker
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "run", "preview"]
```

## 📞 Support

For support and questions:
- Email: info@herbaltrace.com
- Documentation: [docs.herbaltrace.com]
- Issues: [GitHub Issues](https://github.com/your-username/herbal-trace/issues)

---

Built with ❤️ for a more transparent herbal industry.