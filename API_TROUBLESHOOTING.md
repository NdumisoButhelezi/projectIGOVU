# IGOVU API Troubleshooting Guide

This guide helps you diagnose and fix common API issues in the IGOVU platform.

## Common API Errors and Solutions

### 1. "Internal Server Error (500)" on API Endpoints

If you're experiencing 500 errors on `/api/geocode`, `/api/check-stock`, or `/api/sync-stock`, follow these steps:

#### Firebase Credentials Issues

Most likely cause: Missing or invalid Firebase service account credentials.

**Solution:**
1. Go to your Firebase project console
2. Navigate to Project Settings > Service accounts
3. Click "Generate new private key" and download the JSON file
4. In your deployment platform (Vercel):
   - Add environment variable `GOOGLE_APPLICATION_CREDENTIALS_JSON` 
   - Copy the entire content of the downloaded JSON as the value

#### Geocoding API Key Issues

If address autocomplete is failing:

**Solution:**
1. Get a valid API key from [Geoapify](https://www.geoapify.com/)
2. In your deployment platform:
   - Add environment variable `OSM_API_KEY`
   - Set the value to your Geoapify API key

### 2. "Network Connection Refused" Errors

If you're seeing network connection errors when trying to sync stock:

**Solution:**
1. Verify your network connectivity and firewall settings
2. Check if the API endpoint is accessible from your network
3. Try using the production URL directly: `https://your-deployed-site.com/api/sync-stock`

### 3. Stock Data Inconsistencies

If stock levels are inconsistent or not updating:

**Solution:**
1. Manually trigger a stock sync from the admin panel
2. Check Firebase Firestore directly to verify stock levels
3. Clear your local storage cache in your browser
4. Reset the stock levels manually in the Firebase console if needed

## Testing API Endpoints

You can test your API endpoints directly using these commands:

```bash
# Test geocoding API
curl -X GET "https://your-deployed-site.com/api/geocode?text=durban"

# Test stock check API
curl -X GET "https://your-deployed-site.com/api/check-stock?productId=PRODUCT_ID"

# Test stock sync API
curl -X POST "https://your-deployed-site.com/api/sync-stock"
```

Replace `your-deployed-site.com` with your actual domain.

## Recovery Options

### Manual Stock Data Recovery

If your Firebase database is corrupted or inaccessible:

1. Access the admin panel at `/admin`
2. Use the "Stock Recovery" tool to load backup data
3. Verify the stock levels after recovery

### Offline Mode

The application is built with offline capabilities:

1. Stock data is cached locally for 24 hours
2. Address autocomplete has multiple fallback mechanisms
3. Checkout can proceed even with limited connectivity

## Environment Variable Reference

| Variable Name | Description | Required |
|---------------|-------------|----------|
| `GOOGLE_APPLICATION_CREDENTIALS_JSON` | Firebase service account credentials (entire JSON) | Yes |
| `OSM_API_KEY` | Geoapify API key for address autocomplete | Yes |
| `BACKUP_STOCK_API` | Backup API endpoint for stock data (optional) | No |

## Technical Support

If you're still experiencing issues:

1. Check the server logs in your deployment platform
2. Contact technical support at support@igovu.co.za
3. Include any error messages and the URL where the issue is occurring
