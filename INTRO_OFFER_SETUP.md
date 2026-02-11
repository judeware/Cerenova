# Cerenova Intro Offer Campaign Funnel - Setup Guide

## Overview
The `/intro-offer` page is a high-conversion campaign funnel designed to capture leads and guide them to book their first session with Cerenova Psychology.

## Features Implemented

### 1. Multi-Step Form
- **Step 1**: Hero with welcome message and CTA
- **Step 2**: Eligibility confirmation (Mental Health Care Plan) + email capture
- **Step 3**: Pricing disclosure with dynamic discount code + booking button

### 2. Google Sheets Integration
- Saves leads to the 'Leads' tab with:
  - Email
  - Eligibility confirmation status
  - Timestamp
  - All UTM parameters (source, medium, campaign, content, term)
- Fetches dynamic discount code from 'Admin' tab (cell A2)

### 3. GA4 Analytics
- Tracks page views with UTM parameters
- Tracks funnel progression (Step 1, 2, 3)
- Tracks button clicks (Get Started, Submit, Book Now)

## Environment Variables Setup

### For Local Development
Create a `.env` file in the root directory with:
```
VITE_GA_MEASUREMENT_ID=G-XXXXXXXXXX
```

### For Netlify Deployment
Add these environment variables in Netlify Dashboard > Site Settings > Environment Variables:

1. **Google Analytics:**
   - `VITE_GA_MEASUREMENT_ID` - Your GA4 Measurement ID

2. **Google Sheets API Credentials:**
   From your Google Service Account JSON file, extract and add:
   - `GOOGLE_SERVICE_ACCOUNT_EMAIL` - The service account email
   - `GOOGLE_PRIVATE_KEY` - The private key (include the full key with BEGIN/END markers)
   - `GOOGLE_PROJECT_ID` - Your Google Cloud project ID
   - `GOOGLE_PRIVATE_KEY_ID` - The private key ID
   - `GOOGLE_CLIENT_ID` - The client ID
   - `GOOGLE_CLIENT_CERT_URL` - The certificate URL

3. **Google Sheet Configuration:**
   - `GOOGLE_SHEET_ID` - The ID from your Google Sheet URL

## Google Sheets Setup

1. Create a Google Sheet with two tabs:
   - **Leads**: For storing form submissions
   - **Admin**: For the discount code (put the code in cell A2)

2. Set up the Leads tab with these column headers (row 1):
   - Column A: Email
   - Column B: Eligibility
   - Column C: Timestamp
   - Column D: UTM Source
   - Column E: UTM Medium
   - Column F: UTM Campaign
   - Column G: UTM Content
   - Column H: UTM Term

3. Share the Google Sheet with your service account email (read/write permissions)

## Google Service Account Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project or select existing
3. Enable Google Sheets API
4. Create a Service Account:
   - Go to IAM & Admin > Service Accounts
   - Create new service account
   - Download the JSON key file
5. Use the values from this JSON file for the environment variables

## Testing the Funnel

1. Access the funnel with UTM parameters:
   ```
   http://localhost:5173/intro-offer?utm_source=facebook&utm_medium=cpc&utm_campaign=intro_offer
   ```

2. Complete all three steps to test:
   - Click "Yes - Get Started"
   - Check the eligibility box
   - Enter an email
   - Submit the form
   - Verify the discount code appears
   - Click "Book Now"

3. Check your Google Sheet to confirm the lead was saved

## Campaign URL Examples

Use these URL formats for your marketing campaigns:

- Facebook Ads:
  ```
  https://cerenova.com.au/intro-offer?utm_source=facebook&utm_medium=cpc&utm_campaign=intro_offer&utm_content=ad_variant_a
  ```

- Google Ads:
  ```
  https://cerenova.com.au/intro-offer?utm_source=google&utm_medium=cpc&utm_campaign=intro_offer&utm_term=online_psychology
  ```

- Email Campaign:
  ```
  https://cerenova.com.au/intro-offer?utm_source=email&utm_medium=newsletter&utm_campaign=intro_offer
  ```

## Troubleshooting

1. **Discount code not loading:**
   - Check that cell A2 in the Admin tab contains a value
   - Verify the service account has read access to the sheet
   - Check Netlify function logs for errors

2. **Leads not saving:**
   - Ensure the service account has write access to the sheet
   - Check that all environment variables are properly set in Netlify
   - Look for errors in browser console and Netlify function logs

3. **GA4 not tracking:**
   - Verify the measurement ID is correct
   - Check that events are appearing in GA4 Realtime reports
   - Use GA4 DebugView for detailed tracking verification

## Notes
- The booking button redirects to Liam Farrelly's Halaxy booking page
- All form submissions are validated client-side
- The multi-step form maintains state without page refreshes
- Mobile-optimized with responsive design
