# Vercel Deployment Guide

This guide will help you deploy your project to Vercel with all the necessary environment variables configured.

## Prerequisites

- Vercel CLI installed: `npm i -g vercel`
- Vercel account linked: `vercel login`

## Step 1: Deploy to Vercel

1. Navigate to your project directory
2. Run the initial deployment:
```bash
vercel
```

## Step 2: Configure Environment Variables

### Option A: Using Vercel Dashboard

1. Go to your Vercel project dashboard
2. Navigate to Settings → Environment Variables
3. Add all variables from `.env.production`:

#### Client-side Variables (Available to frontend):
- `VITE_FIREBASE_API_KEY` = `AIzaSyAN_L-zfDVCH_jvYaqFI8gSPPVChzW3OUg`
- `VITE_FIREBASE_AUTH_DOMAIN` = `igovu-e05f4.firebaseapp.com`
- `VITE_FIREBASE_PROJECT_ID` = `igovu-e05f4`
- `VITE_FIREBASE_STORAGE_BUCKET` = `igovu-e05f4.appspot.com`
- `VITE_FIREBASE_MESSAGING_SENDER_ID` = `480096199930`
- `VITE_FIREBASE_APP_ID` = `1:480096199930:web:67c5ecbaa967b6249dd543`
- `VITE_YOCO_PUBLIC_KEY` = `pk_test_2379d5d3l6j6Djea1e94`
- `VITE_API_BASE_URL` = `https://project-igovu.vercel.app/api`

#### Server-side Variables (API functions only):
- `YOCO_SECRET_KEY` = `sk_test_f15fd1dfaOqO3qr138845a9b3d2a`
- `SHIPLOGIC_API_KEY` = `a601d99c75fc4c64b5a64288f97d52b4`
- `COURIERGUY_API_KEY` = `58fb647e6ac1490db29ccf51f87016a5`
- `OSM_API_KEY` = `5c04aa8d5748416ca18eba80bc388afd`

#### Firebase Admin Service Account Variables:
- `FIREBASE_TYPE` = `service_account`
- `FIREBASE_PROJECT_ID` = `igovu-e05f4`
- `FIREBASE_PRIVATE_KEY_ID` = `0351b83b9ae208d1ad239c92ff9403e709e60c44`
- `FIREBASE_PRIVATE_KEY` = `"-----BEGIN PRIVATE KEY-----\nMIIEvAIBADANBgkqhkiG9w0BAQEFAASCBKYwggSiAgEAAoIBAQCkJrdhLtGBJUbN\n87HdPuC8wlTtsSUFBzQoI/anpA+l4Y1LsbliwgzSj+8UX0NE0sZo1OK7Xx6DESia\nK9v27OVuBoADEwDGEKMAL4HIR9I44TUkvd/c4jgDUOnyKCTTFv6UVj7Mr0qXYjSs\nVDTRJIUDaNmQBQjPknPrSSG1mco+7QvfP9GkmYS6kSWy8SgNMvz1XlE8+sUJOwHS\nw8LLyZhmhFyJTN0jty5mTwBJC1SH3m48Mn52fW8kuMB9bxOS85lxLrzJI4avkh7O\nwL7Tc0IS++taYTu+BCeMQqN/NEacCTTar41iZC7GQa/pT/7Qzv+82VsA/dmEsiHk\nRRoTm6HTAgMBAAECggEAA5hvmE9jmMzNml0kWd4ywbEzm+CjAIQY4LJMZChK+k6+\nSx6T3fD/NXl7nDXQPsQZNtRrpvCe8s2bRJZdQCUCBRlz0x1p3q/LE7qtg90wxAXk\nUFbmQP3662+ss/JXJzHUjWUH7OqSMMhJRUKO6ZqUvrJr2YYMnFsfqaJ4lOHC2a2s\n6q/j7uMP0lpWRDMAEGZow536km+1KRHEqIsk/ncmmDUtoC7lt2ibSMk7lym9qkXS\nLKfr40a0nU1EWY6+OyCKLJ1jluajhuWkKZlfex+OJAat2DYamEw69p4ddmYnylxt\nwBFa+wKQgljDs7owphlDA66lREQqx/8eoa9jGKL8AQKBgQDR6h9fzxyrvcJjcaYC\njwt7pTr7npuwBM8ZZbAaVkfUetfbSQjXhlQ6Jx8MooB0/tbcsHUnyFE833pDLevx\njye7QIIQCbmNn4UTz1lFPsHrYlj45ZB27HLK1yhrGXfvasVeIp6+dZLdcWJIsvRh\nDH5UXXwxkV2O7M1boUoC0XQP0wKBgQDIMIw2KhSL3PEX1GIjmqNRofTDUwvAUiwy\nRTcV3eTM120hlJX02O+xLDMjHH4BCPBJsUaAoYg/LW1pfKYvLPCeqEF/6oof9Io3\nlxu8I8ow4WxBHUtwxEqki5qGQ9FVbWb6Gk11yMf1xDvzsGCX91GZs5mgqHJ1Ydug\na72PjlDmAQKBgFvbz0T29j31eUZZKmN+Q3ElOi14F/sr75DWnfy4exBxfVpZmIPw\nJZWZHw5BYmNQTagfk/UHxP0VcoRJaTG5CpL3xLLN/qQKBYtItnEF6Ihf7j1lABX6\nLVE+Ev9xi1AFQR/s+X2v4EmJ/NWVHjPpcy3aCysxztPRwJtD10yWU6/AoGADsQV\n84DTFyXq2pkdzAaB+Wl6xlV/zmXBQMv+Liy5zaouMIXnMbI2q9jYxMQ7PxRLtQPQ\ncXh4tkBBi8BX+a7U6L78ZdUE7yp4b3VD5HK3XTejZoIkqGKyJsTtVu31qNly+Qur\nnv56UVRyH51o4oyphi7LLCCAoMvhCUopJ0eWDAECgYBBoHDo2To6iiPOd+xDSJVO\n9BEiOR/Ykx2K7NgfrxJn4xckjGB8iOEuizjnkqwPrj14pm4jtDduPuhqNnQo7LJj\nKIhmwp7plTx38BUhaixni2rm3xHX71wwuPnq/VPHR4d1qo5zHGZAdIqvcoBR2fV7\nqTe7HrzB9HFfL2LHqPWzzg==\n-----END PRIVATE KEY-----"`
- `FIREBASE_CLIENT_EMAIL` = `firebase-adminsdk-fbsvc@igovu-e05f4.iam.gserviceaccount.com`
- `FIREBASE_CLIENT_ID` = `101640377554511788994`
- `FIREBASE_AUTH_URI` = `https://accounts.google.com/o/oauth2/auth`
- `FIREBASE_TOKEN_URI` = `https://oauth2.googleapis.com/token`
- `FIREBASE_AUTH_PROVIDER_X509_CERT_URL` = `https://www.googleapis.com/oauth2/v1/certs`
- `FIREBASE_CLIENT_X509_CERT_URL` = `https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-fbsvc%40igovu-e05f4.iam.gserviceaccount.com`
- `FIREBASE_UNIVERSE_DOMAIN` = `googleapis.com`

### Option B: Using Vercel CLI

```bash
# Set environment variables via CLI
vercel env add VITE_FIREBASE_API_KEY
vercel env add VITE_FIREBASE_AUTH_DOMAIN
vercel env add VITE_FIREBASE_PROJECT_ID
# ... (continue for all variables)
```

## Step 3: Redeploy

After setting all environment variables, redeploy your project:

```bash
vercel --prod
```

## Step 4: Test the Deployment

1. Visit your deployed URL
2. Test the payment flow
3. Check the browser console for any errors
4. Verify API endpoints are working:
   - `/api/yoco-checkout`
   - `/api/check-stock-simple`
   - `/api/sync-stock-simple`

## Troubleshooting

### Firebase Issues
- Check Vercel function logs for Firebase initialization errors
- Ensure `FIREBASE_PRIVATE_KEY` includes the full key with newlines (`\n`)
- Verify all Firebase environment variables are set correctly

### API Errors
- Check Vercel function logs: `vercel logs`
- Ensure CORS headers are properly configured
- Verify API keys are correctly set

### Payment Issues
- Test with Yoco test keys first
- Check network tab for API response details
- Verify webhook URLs if using hosted checkout

## Environment Variable Security

- Never commit `.env` files to git
- Use different API keys for development and production
- Regularly rotate sensitive keys
- Monitor Vercel usage for any unusual activity

## File Structure for Vercel

```
/
├── api/                    # Serverless functions
│   ├── yoco-checkout.js   # Payment processing
│   ├── check-stock-simple.js
│   └── sync-stock-simple.js
├── src/                   # React frontend
├── firebase-admin.cjs     # Firebase Admin setup
├── vercel.json           # Vercel configuration
└── .env.production       # Environment variables template
```

## Next Steps

1. Monitor the deployment for any errors
2. Set up monitoring/alerting for API failures
3. Consider implementing rate limiting
4. Set up proper logging and analytics
