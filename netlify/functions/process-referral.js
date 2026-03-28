const busboy = require('busboy');
const fetch = require('node-fetch');

// Helper function to parse multipart form data
function parseMultipartForm(event) {
  return new Promise((resolve, reject) => {
    const bb = busboy({
      headers: event.headers,
      limits: {
        fileSize: 10 * 1024 * 1024 // 10MB limit
      }
    });
    
    const fields = {};
    const files = {};
    
    bb.on('file', (fieldname, file, info) => {
      const chunks = [];
      const filename = info.filename;
      const mimetype = info.mimeType;
      
      file.on('data', (data) => {
        chunks.push(data);
      });
      
      file.on('end', () => {
        files[fieldname] = {
          filename: filename || 'document',
          mimetype: mimetype || 'application/octet-stream',
          buffer: Buffer.concat(chunks)
        };
      });
      
      file.on('limit', () => {
        reject(new Error(`File ${filename} exceeds size limit`));
      });
    });
    
    bb.on('field', (fieldname, val) => {
      fields[fieldname] = val;
    });
    
    bb.on('finish', () => {
      resolve({ fields, files });
    });
    
    bb.on('error', reject);
    
    bb.write(Buffer.from(event.body, 'base64'));
    bb.end();
  });
}

// Helper function to upload file to HubSpot
async function uploadToHubSpot(file, accessToken) {
  try {
    // Create FormData for multipart upload
    const FormData = require('form-data');
    const form = new FormData();
    
    // Add the file - explicitly provide filename to avoid path error
    form.append('file', file.buffer, {
      filename: file.filename || 'referral-document.pdf',
      contentType: file.mimetype || 'application/pdf'
    });
    
    // Add file options
    form.append('options', JSON.stringify({
      access: 'PUBLIC_INDEXABLE',
      ttl: 'P6M', // 6 months
      overwrite: false
    }));
    
    // Set folder path
    form.append('folderPath', '/GP Referrals');
    
    // Upload file to HubSpot
    const uploadResponse = await fetch(
      'https://api.hubapi.com/files/v3/files',
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          ...form.getHeaders()
        },
        body: form
      }
    );

    if (!uploadResponse.ok) {
      const errorText = await uploadResponse.text();
      throw new Error(`Failed to upload file to HubSpot: ${errorText}`);
    }

    const fileData = await uploadResponse.json();
    return fileData.url; // Return the public URL
  } catch (error) {
    console.error('Error uploading file to HubSpot:', error);
    throw error;
  }
}

// Helper function to format date for HubSpot
function formatDateForHubSpot(dateString) {
  const date = new Date(dateString);
  date.setHours(0, 0, 0, 0);
  return date.getTime();
}

exports.handler = async (event) => {
  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method Not Allowed' })
    };
  }

  try {
    // Check for HubSpot access token
    if (!process.env.HUBSPOT_ACCESS_TOKEN) {
      throw new Error('HUBSPOT_ACCESS_TOKEN is not configured');
    }

    const accessToken = process.env.HUBSPOT_ACCESS_TOKEN;

    // Parse multipart form data
    const { fields, files } = await parseMultipartForm(event);

    // Validate required fields
    const requiredFields = ['gpName', 'gpEmail', 'patientName', 'patientDOB', 'patientMobile', 'patientEmail'];
    for (const field of requiredFields) {
      if (!fields[field]) {
        return {
          statusCode: 400,
          body: JSON.stringify({ error: `Missing required field: ${field}` })
        };
      }
    }

    // Validate required files
    if (!files.referralLetter || !files.mhcp) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Missing required documents' })
      };
    }

    // Upload files to HubSpot
    console.log('Uploading referral letter to HubSpot...');
    const referralLetterUrl = await uploadToHubSpot(files.referralLetter, accessToken);
    
    console.log('Uploading MHCP to HubSpot...');
    const mhcpUrl = await uploadToHubSpot(files.mhcp, accessToken);

    // Step 1: Create or update contact (patient)
    const contactProperties = {
      email: fields.patientEmail,
      firstname: fields.patientName.split(' ')[0],
      lastname: fields.patientName.split(' ').slice(1).join(' ') || '',
      mobilephone: fields.patientMobile
    };

    // Search for existing contact by email
    const searchResponse = await fetch(
      `https://api.hubapi.com/crm/v3/objects/contacts/search`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          filterGroups: [{
            filters: [{
              propertyName: 'email',
              operator: 'EQ',
              value: fields.patientEmail
            }]
          }]
        })
      }
    );

    let contactId;
    const searchData = await searchResponse.json();

    if (searchData.total > 0) {
      // Update existing contact
      contactId = searchData.results[0].id;
      await fetch(
        `https://api.hubapi.com/crm/v3/objects/contacts/${contactId}`,
        {
          method: 'PATCH',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ properties: contactProperties })
        }
      );
    } else {
      // Create new contact
      const createContactResponse = await fetch(
        `https://api.hubapi.com/crm/v3/objects/contacts`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ properties: contactProperties })
        }
      );

      if (!createContactResponse.ok) {
        throw new Error(`Failed to create contact: ${await createContactResponse.text()}`);
      }

      const contactData = await createContactResponse.json();
      contactId = contactData.id;
    }

    // Step 2: Create deal in GP Referrals pipeline with specific IDs
    const dealProperties = {
      dealname: `GP Referral - ${fields.patientName}`,
      pipeline: '1620199873',  // GP Referrals pipeline ID
      dealstage: '2698204656', // Referral Received stage ID
      amount: 220, // Initial session value
      gp_name: fields.gpName,
      gp_email: fields.gpEmail,
      patient_dob: formatDateForHubSpot(fields.patientDOB),
      gp_referral_letter_url: referralLetterUrl,
      mhcp_url: mhcpUrl,
      description: `Referral from Dr. ${fields.gpName} for ${fields.patientName}`
    };

    // Create deal with associations included in the payload
    const createDealPayload = {
      properties: dealProperties,
      associations: [
        {
          to: {
            id: contactId
          },
          types: [
            {
              associationCategory: 'HUBSPOT_DEFINED',
              associationTypeId: 3 // Deal-to-Contact association
            }
          ]
        }
      ]
    };

    const createDealResponse = await fetch(
      `https://api.hubapi.com/crm/v3/objects/deals`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(createDealPayload)
      }
    );

    if (!createDealResponse.ok) {
      throw new Error(`Failed to create deal: ${await createDealResponse.text()}`);
    }

    const dealData = await createDealResponse.json();

    console.log('GP Referral processed successfully');

    return {
      statusCode: 200,
      body: JSON.stringify({
        success: true,
        message: 'Referral submitted successfully',
        contactId,
        dealId: dealData.id
      })
    };
  } catch (error) {
    console.error('Error processing referral:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: 'Failed to process referral',
        message: error.message
      })
    };
  }
};