# Cerenova Intro Offer Campaign Funnel - Workload Identity Federation Setup Guide

## Overview
This guide explains how to set up the `/intro-offer` campaign funnel using **Workload Identity Federation (WIF)** instead of service account keys. This approach is more secure and complies with Google's security baseline policies that block service account API keys.

## What is Workload Identity Federation?
WIF allows your Netlify Functions to authenticate to Google Cloud using OpenID Connect (OIDC) tokens instead of static service account keys. The authentication flow works like this:
1. Netlify Function generates a JWT token with site information
2. Google Cloud trusts Netlify as an identity provider
3. The JWT is exchanged for Google Cloud credentials
4. These temporary credentials are used to access Google Sheets

## Prerequisites
1. A Google Cloud Project with billing enabled
2. A Netlify site for deployment
3. Admin access to both Google Cloud Console and Netlify

## Google Cloud Console Setup

### Step 1: Enable Required APIs
1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Select your project
3. Enable the following APIs:
   - Google Sheets API
   - IAM Service Account Credentials API
   - Security Token Service API

### Step 2: Create a Service Account
1. Go to **IAM & Admin > Service Accounts**
2. Click **Create Service Account**
3. Use these details:
   - **Name**: `cerenova-sheets`
   - **ID**: `cerenova-sheets` (this creates email: `cerenova-sheets@YOUR_PROJECT_ID.iam.gserviceaccount.com`)
   - **Description**: "Service account for Cerenova intro offer Google Sheets integration"
4. Click **Create and Continue**
5. Skip the optional steps and click **Done**

### Step 3: Create Workload Identity Pool
1. Go to **IAM & Admin > Workload Identity Federation**
2. Click **Create Pool**
3. Configure the pool:
   - **Name**: `netlify-functions-pool`
   - **Pool ID**: `netlify-functions-pool`
   - **Description**: "Identity pool for Netlify Functions"
4. Click **Continue**

### Step 4: Add Provider to Pool
1. Select **OpenID Connect (OIDC)** as the provider type
2. Configure the provider:
   - **Provider name**: `netlify-provider`
   - **Provider ID**: `netlify-provider`
   - **Issuer URL**: `https://netlify.com`
   - **Audience**: Your Netlify Site ID (found in Netlify dashboard)
3. Under **Attribute mapping**, add:
   - `google.subject` = `assertion.sub`
   - `attribute.site_id` = `assertion.site_id`
   - `attribute.function_name` = `assertion.function_name`
4. Click **Save**

### Step 5: Grant Access to Service Account
1. Still in the Workload Identity Federation page, find your pool
2. Click on **Grant Access**
3. Select **Service Account**: `cerenova-sheets@YOUR_PROJECT_ID.iam.gserviceaccount.com`
4. Under **Principals**, add:
   - **Attribute name**: `site_id`
   - **Attribute value**: Your Netlify Site ID
5. Click **Save**

### Step 6: Configure IAM Permissions
1. Go to **IAM & Admin > IAM**
2. Find your service account (`cerenova-sheets@...`)
3. Click **Edit** (pencil icon)
4. Add these roles:
   - **Workload Identity User** (required for WIF)
   - **Service Account Token Creator** (for impersonation)
5. Click **Save**

## Google Sheets Setup

### Step 1: Create the Google Sheet
1. Create a new Google Sheet
2. Create two tabs:
   - **Leads** - For storing form submissions
   - **Admin** - For the discount code

### Step 2: Set up the Leads tab
Add these headers in row 1:
- Column A: Email
- Column B: Eligibility
- Column C: Timestamp
- Column D: UTM Source
- Column E: UTM Medium
- Column F: UTM Campaign
- Column G: UTM Content
- Column H: UTM Term

### Step 3: Set up the Admin tab
- Put your discount code in cell **A2**

### Step 4: Share with Service Account
1. Click **Share** button
2. Add: `cerenova-sheets@YOUR_PROJECT_ID.iam.gserviceaccount.com`
3. Give **Editor** permission
4. Click **Send**

## Netlify Configuration

### Environment Variables
Add these to your Netlify site (Site Settings > Environment Variables):

```bash
# Google Analytics
VITE_GA_MEASUREMENT_ID=G-XXXXXXXXXX

# Google Cloud Project (IMPORTANT: You need both!)
GOOGLE_CLOUD_PROJECT=your-project-id
GOOGLE_PROJECT_NUMBER=123456789012

# Service Account Email
GOOGLE_SERVICE_ACCOUNT_EMAIL=cerenova-sheets@YOUR_PROJECT_ID.iam.gserviceaccount.com

# Workload Identity Federation
WORKLOAD_IDENTITY_POOL_ID=netlify-functions-pool
WORKLOAD_IDENTITY_PROVIDER_ID=netlify-provider

# Google Sheets
GOOGLE_SHEET_ID=your-sheet-id-from-url

# Netlify automatically provides these
# NETLIFY_SITE_ID=your-netlify-site-id
# NETLIFY_SITE_URL=https://your-site.netlify.app

# For Production (optional but recommended)
# JWT_SIGNING_KEY=-----BEGIN RSA PRIVATE KEY-----\n...\n-----END RSA PRIVATE KEY-----
# JWT_KEY_ID=netlify-function-key-1
```

### Finding Your Values:
- **GOOGLE_CLOUD_PROJECT**: Your Google Cloud project ID (e.g., `my-project`)
- **GOOGLE_PROJECT_NUMBER**: Found in Google Cloud Console > Dashboard (12-digit number)
- **GOOGLE_SHEET_ID**: The long ID in your Google Sheet URL between `/d/` and `/edit`
- **NETLIFY_SITE_ID**: Found in Netlify dashboard > Site Settings > General > Site ID

### Important Note about Authentication
The Netlify functions now use a `subject_token_supplier` function to dynamically generate JWT tokens. This is required because Netlify doesn't provide a metadata server like Google Cloud does. The functions will:
1. First check if Netlify Identity is enabled and use that token
2. Otherwise generate a JWT token for authentication
3. For production, consider using a proper RSA key pair for signing JWTs

## Testing the Integration

### 1. Local Testing
WIF authentication requires a deployed environment. For local testing, you can:
- Deploy to a Netlify branch deploy
- Use Netlify Dev with proper environment variables

### 2. Production Testing
1. Deploy your site to Netlify
2. Visit: `https://your-site.netlify.app/intro-offer?utm_source=test&utm_medium=test`
3. Complete the funnel:
   - Click "Yes - Get Started"
   - Check the eligibility box
   - Enter a test email
   - Verify discount code loads
4. Check your Google Sheet for the new lead entry

## Troubleshooting

### Common Issues:

1. **"Permission denied" errors**
   - Verify the service account has Editor access to the Google Sheet
   - Check that Workload Identity User role is assigned
   - Ensure the pool and provider IDs match exactly

2. **"Invalid grant" errors**
   - Verify the Netlify Site ID in attribute conditions matches your actual site
   - Check that all environment variables are set correctly
   - Ensure the issuer URL is exactly `https://netlify.com`

3. **Discount code not loading**
   - Verify cell A2 in the Admin tab has a value
   - Check function logs in Netlify for detailed error messages

4. **Leads not saving**
   - Ensure the Leads tab has the correct headers in row 1
   - Verify the service account has write permissions

### Debug Steps:
1. Check Netlify Function logs: `Netlify Dashboard > Functions > View logs`
2. Verify environment variables are set: `Netlify Dashboard > Site settings > Environment variables`
3. Test authentication separately using Google's Token Info endpoint

## Security Benefits
- No service account keys stored anywhere
- Credentials are temporary and auto-rotate
- Authentication tied to your specific Netlify site
- Complies with Google's security baseline policies

## Additional Notes
- The JWT tokens generated are valid for 1 hour
- Google Cloud automatically handles token refresh
- Each function invocation gets fresh credentials
- No manual key rotation required