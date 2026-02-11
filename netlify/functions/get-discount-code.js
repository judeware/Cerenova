const { google } = require('googleapis');
const { GoogleAuth } = require('google-auth-library');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

exports.handler = async (event, context) => {
  // Only allow GET requests
  if (event.httpMethod !== 'GET') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method Not Allowed' }),
    };
  }

  try {
    // Create the external account credentials configuration with subject_token_supplier
    const externalAccountConfig = {
      type: 'external_account',
      audience: `//iam.googleapis.com/projects/${process.env.GOOGLE_PROJECT_NUMBER}/locations/global/workloadIdentityPools/${process.env.WORKLOAD_IDENTITY_POOL_ID}/providers/${process.env.WORKLOAD_IDENTITY_PROVIDER_ID}`,
      subject_token_type: 'urn:ietf:params:oauth:token-type:jwt',
      token_url: 'https://sts.googleapis.com/v1/token',
      service_account_impersonation_url: `https://iamcredentials.googleapis.com/v1/projects/-/serviceAccounts/${process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL}:generateAccessToken`,
      scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
      // Use subject_token_supplier with proper SubjectTokenSupplier interface
      subject_token_supplier: {
        getSubjectToken: async () => {
          if (!process.env.PRIVATE_KEY_PEM) {
            throw new Error('PRIVATE_KEY_PEM environment variable is not set');
          }
          
          // Decode the Base64 variable back into a utf-8 string
          const decodedKey = Buffer.from(process.env.PRIVATE_KEY_PEM, 'base64').toString('utf-8');
          
          // Load the key
          const rsaPrivateKey = crypto.createPrivateKey({
            key: decodedKey,
            format: 'pem'
          });
          
          // Create JWT payload with exact requirements
          const payload = {
            iss: 'https://netlify.com',
            sub: process.env.NETLIFY_SITE_ID || '3e0bc499',
            aud: `https://iam.googleapis.com/projects/${process.env.GOOGLE_PROJECT_NUMBER}/locations/global/workloadIdentityPools/netlify-functions-pool/providers/netlify-provider`,
            iat: Math.floor(Date.now() / 1000),
            exp: Math.floor(Date.now() / 1000) + 3600 // 1 hour expiration
          };
          
          // Sign the JWT with RS256 and specific header using KeyObject
          const token = jwt.sign(payload, rsaPrivateKey, {
            algorithm: 'RS256',
            header: {
              alg: 'RS256',
              kid: 'netlify-key-2',
              typ: 'JWT'
            }
          });
          
          return token;
        }
      }
    };

    // Initialize GoogleAuth with external account
    const auth = new GoogleAuth({
      credentials: externalAccountConfig,
      projectId: process.env.GOOGLE_CLOUD_PROJECT || process.env.GOOGLE_PROJECT_NUMBER,
      scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'] // Explicitly force this scope
    });

    const sheets = google.sheets({ version: 'v4', auth });

    // Fetch discount code from Admin tab, cell A2
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: process.env.GOOGLE_SHEET_ID,
      range: 'Admin!A2',
    });

    const discountCode = response.data.values?.[0]?.[0] || '';

    return {
      statusCode: 200,
      body: JSON.stringify({ 
        success: true,
        discountCode: discountCode
      }),
    };
  } catch (error) {
    console.error('Error fetching discount code:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ 
        error: 'Failed to fetch discount code',
        details: error.message 
      }),
    };
  }
};
