# IGOVU E-commerce Platform

A React + TypeScript e-commerce platform for IGOVU clothing brand with payment processing, geocoding, and stock management.

## 🚀 Quick Start

### Prerequisites
- Node.js 16.x or higher
- npm 8.x or higher
- Firebase account
- Yoco payment gateway account
- Geoapify API key

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/project-igovu.git
cd project-igovu
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the root directory with the following variables:
```
VITE_FIREBASE_API_KEY=your-firebase-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-firebase-auth-domain
VITE_FIREBASE_PROJECT_ID=your-firebase-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-firebase-storage-bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your-firebase-messaging-sender-id
VITE_FIREBASE_APP_ID=your-firebase-app-id
VITE_OSM_API_KEY=your-geoapify-api-key
VITE_YOCO_PUBLIC_KEY=your-yoco-public-key
```

4. Set up Firebase Admin SDK for the server-side functions:
   - Generate a service account key from Firebase console
   - Save it as `firebase-admin.js` in the project root (for local development)
   - For production deployment, add the entire JSON as an environment variable named `GOOGLE_APPLICATION_CREDENTIALS_JSON`

5. Start the development server:
```bash
npm run dev
```

## 🏗️ Project Structure

```
projectIGOVU/
├── api/                    # Serverless API functions
│   ├── check-stock.js      # API for checking product stock levels
│   ├── courierguy-quote.js # API for getting shipping quotes
│   ├── geocode.js          # API for address lookup and geocoding
│   ├── sync-stock.js       # API for synchronizing stock levels
│   └── yoco-checkout.js    # API for processing payments with Yoco
├── public/                 # Static assets
├── scripts/                # Utility scripts
├── server/                 # Express server for development
├── src/
│   ├── components/         # React components
│   ├── config/             # Application configuration
│   ├── contexts/           # React contexts (Auth, Cart, etc.)
│   ├── data/               # Static data
│   ├── pages/              # Page components
│   ├── services/           # Service modules
│   └── utils/              # Utility functions
├── .env                    # Environment variables
└── firebase-admin.js       # Firebase Admin SDK configuration
```

## 🔧 API Endpoints

| Endpoint | Description | Method | Parameters |
|----------|-------------|--------|------------|
| `/api/check-stock` | Check product stock levels | GET | `productId` |
| `/api/geocode` | Address lookup and autocomplete | GET | `text`, `limit`, `lang` |
| `/api/sync-stock` | Synchronize stock levels | POST | `productId`, `quantity`, `action` |
| `/api/yoco-checkout` | Process payment with Yoco | POST | `token`, `amountInCents`, `currency` |
| `/api/courierguy-quote` | Get shipping cost estimate | POST | `address`, `items` |

## 🚢 Deployment

### Deploying to Vercel

1. Create a new project on Vercel
2. Connect your GitHub repository
3. Add environment variables:
   - `GOOGLE_APPLICATION_CREDENTIALS_JSON`: The entire Firebase service account JSON
   - `OSM_API_KEY`: Your Geoapify API key
   - `YOCO_SECRET_KEY`: Your Yoco secret key
4. Deploy!

See [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) for detailed instructions.

### Troubleshooting API Issues

If you encounter API errors in your deployment, refer to [API_TROUBLESHOOTING.md](./API_TROUBLESHOOTING.md) for solutions to common issues.

## 🧪 Testing

```bash
npm test                # Run all tests
npm run test:unit       # Run unit tests
npm run test:e2e        # Run end-to-end tests
```

## 📱 Features

- 🛒 Full shopping cart functionality with persistent state
- 🔐 User authentication with Firebase
- 📦 Real-time stock management and synchronization
- 💳 Secure payment processing with Yoco
- 🚚 Shipping cost calculation with CourierGuy integration
- 📱 Fully responsive design for mobile and desktop
- 📍 Address lookup and geocoding for shipping
- 📊 Admin dashboard for product and order management

## 🔒 Security

The application implements multiple security measures:

- Firebase Authentication for secure user management
- Server-side verification for all payment transactions
- No storage of sensitive payment information
- CORS protection on all API endpoints
- Rate limiting to prevent abuse

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 📞 Support

For support, email support@igovu.co.za or open an issue in the GitHub repository.
