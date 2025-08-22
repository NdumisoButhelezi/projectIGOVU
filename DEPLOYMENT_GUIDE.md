# IGOVU Firebase Service Account Configuration

If you're seeing API errors on your deployed site, you need to configure the Firebase service account credentials properly.

## Steps to Fix Vercel Deployment API Errors

1. Go to your Firebase project console: https://console.firebase.google.com
2. Go to Project Settings > Service accounts
3. Click "Generate new private key" and download the JSON file
4. In Vercel, go to your project settings > Environment Variables
5. Add a new environment variable:
   - Name: GOOGLE_APPLICATION_CREDENTIALS_JSON
   - Value: Paste the entire content of the downloaded JSON file

## Other Required Environment Variables

Also make sure you have these environment variables set in Vercel:

1. OSM_API_KEY - Your Geoapify API key
2. YOCO_SECRET_KEY - Your Yoco payment gateway secret key
3. SHIPLOGIC_API_KEY - Your Shiplogic API key for delivery quotes

## Testing Your Deployment

After adding these environment variables:
1. Trigger a new deployment in Vercel
2. Test the following endpoints:
   - /api/check-stock?productId=ANY_PRODUCT_ID
   - /api/geocode?text=durban
   - /api/sync-stock (POST request)

## Manual Backup Stock System

If your Firebase integration is still having issues, you can use the "Advanced Stock Recovery" button in the admin panel to reconcile stock levels.
