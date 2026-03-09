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
    
    bb.on('file', (fieldname, file, filename, encoding, mimetype) => {
      const chunks = [];
      
      file.on('data', (data) => {
        chunks.push(data);
      });
      
      file.on('end', () => {
        files[fieldname] = {
          filename,
          mimetype,
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
    // Step 1: Request file upload URL from HubSpot
    const uploadUrlResponse = await fetch(
      `https://api.hubapi.com/files/v3/files/upload-urls`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          size: file.buffer.length,
          name: file.filename,
          options: {
            access: 'PUBLIC_NOT_INDEXABLE',
            type: 'OTHER'
          }
        })
      }
    );

    if (!uploadUrlResponse.ok) {
      throw new Error(`Failed to get upload URL: ${await uploadUrlResponse.text()}`);
    }

    const uploadData = await uploadUrlResponse.json();

    // Step 2: Upload file to the provided URL
    const uploadResponse = await fetch(uploadData.uploadUrl, {
      method: 'PUT',
      headers: {
        'Content-Type': file.mimetype || 'application/octet-stream'
      },
      body: file.buffer
    });

    if (!uploadResponse.ok) {
      throw new Error(`Failed to upload file: ${await uploadResponse.text()}`);
    }

    // Step 3: Register the uploaded file with HubSpot
    const registerResponse = await fetch(
      `https://api.hubapi.com/files/v3/files/upload/finish`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          uploadId: uploadData.uploadId
        })
      }
    );

    if (!registerResponse.ok) {
      throw new Error(`Failed to register file: ${await registerResponse.text()}`);
    }

    const fileData = await registerResponse.json();
    return fileData.objects[0].url; // Return the public URL
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

    // Step 2: Get the GP Referrals pipeline
    const pipelinesResponse = await fetch(
      `https://api.hubapi.com/crm/v3/pipelines/deals`,
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      }
    );

    const pipelines = await pipelinesResponse.json();
    const gpReferralsPipeline = pipelines.results.find(p => p.label === 'GP Referrals');

    if (!gpReferralsPipeline) {
      throw new Error('GP Referrals pipeline not found in HubSpot');
    }

    // Get the first stage (should be "Referral Received")
    const referralReceivedStage = gpReferralsPipeline.stages[0];

    // Step 3: Create deal in GP Referrals pipeline
    const dealProperties = {
      dealname: `GP Referral - ${fields.patientName}`,
      pipeline: gpReferralsPipeline.id,
      dealstage: referralReceivedStage.id,
      amount: 220, // Initial session value
      gp_name: fields.gpName,
      gp_email: fields.gpEmail,
      patient_dob: formatDateForHubSpot(fields.patientDOB),
      gp_referral_letter_url: referralLetterUrl,
      mhcp_url: mhcpUrl,
      description: `Referral from Dr. ${fields.gpName} for ${fields.patientName}`
    };

    const createDealResponse = await fetch(
      `https://api.hubapi.com/crm/v3/objects/deals`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ properties: dealProperties })
      }
    );

    if (!createDealResponse.ok) {
      throw new Error(`Failed to create deal: ${await createDealResponse.text()}`);
    }

    const dealData = await createDealResponse.json();

    // Step 4: Associate deal with contact
    await fetch(
      `https://api.hubapi.com/crm/v3/objects/deals/${dealData.id}/associations/contacts/${contactId}/3`,
      {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      }
    );

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