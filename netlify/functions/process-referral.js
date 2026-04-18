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
    return {
      url: fileData.url,
      id: fileData.id // Return both URL and ID
    };
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
    const referralLetterData = await uploadToHubSpot(files.referralLetter, accessToken);
    
    console.log('Uploading MHCP to HubSpot...');
    const mhcpData = await uploadToHubSpot(files.mhcp, accessToken);

    // Step 1: Create or update contact (patient)
    console.log('Creating/updating contact for patient:', fields.patientName);
    
    const contactProperties = {
      email: fields.patientEmail,
      firstname: fields.patientName.split(' ')[0],
      lastname: fields.patientName.split(' ').slice(1).join(' ') || '',
      mobilephone: fields.patientMobile,
      // Add date of birth as a custom property (requires custom field in HubSpot)
      date_of_birth: fields.patientDOB
    };

    console.log('Contact properties:', JSON.stringify(contactProperties, null, 2));

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
      console.log(`Found existing contact with ID: ${contactId}. Updating...`);
      
      const updateResponse = await fetch(
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

      if (!updateResponse.ok) {
        console.error(`Failed to update contact. Status: ${updateResponse.status}`);
        const errorText = await updateResponse.text();
        console.error(`Error response: ${errorText}`);
        throw new Error(`Failed to update contact: ${errorText}`);
      }
      
      console.log(`Contact ${contactId} updated successfully`);
    } else {
      // Create new contact
      console.log('No existing contact found. Creating new contact...');
      
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
        console.error(`Failed to create contact. Status: ${createContactResponse.status}`);
        const errorText = await createContactResponse.text();
        console.error(`Error response: ${errorText}`);
        throw new Error(`Failed to create contact: ${errorText}`);
      }

      const contactData = await createContactResponse.json();
      contactId = contactData.id;
      console.log(`Contact created successfully with ID: ${contactId}`);
    }

    // Step 2: Create deal in GP Referrals pipeline with specific IDs
    console.log(`Creating deal for patient ${fields.patientName} and associating with contact ${contactId}`);
    
    const dealProperties = {
      dealname: `GP Referral - ${fields.patientName}`,
      pipeline: '1620199873',  // GP Referrals pipeline ID
      dealstage: '2698204656', // Referral Received stage ID
      amount: 220, // Initial session value
      gp_name: fields.gpName,
      gp_email: fields.gpEmail,
      patient_dob: formatDateForHubSpot(fields.patientDOB),
      gp_referral_letter_url: referralLetterData.url,
      mhcp_url: mhcpData.url,
      description: `Referral from Dr. ${fields.gpName} for ${fields.patientName}`
    };

    console.log('Deal properties:', JSON.stringify(dealProperties, null, 2));

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
      console.error(`Failed to create deal. Status: ${createDealResponse.status}`);
      const errorText = await createDealResponse.text();
      console.error(`Error response: ${errorText}`);
      throw new Error(`Failed to create deal: ${errorText}`);
    }

    const dealData = await createDealResponse.json();
    console.log(`Deal created successfully with ID: ${dealData.id} and associated with contact ${contactId}`);

    // Step 3: Create a Note engagement with file attachments linked to both Deal and Contact
    console.log('Creating note with file attachments linked to both deal and contact...');
    console.log(`File IDs - Referral Letter: ${referralLetterData.id}, MHCP: ${mhcpData.id}`);
    console.log(`Associating with Deal ID: ${dealData.id} and Contact ID: ${contactId}`);
    
    const notePayload = {
      properties: {
        hs_timestamp: new Date().toISOString(),
        hs_note_body: `GP Referral Documents:\n\nReferral Letter: ${files.referralLetter.filename}\nMHCP: ${files.mhcp.filename}\n\nReferral from Dr. ${fields.gpName} for ${fields.patientName}`,
        hs_attachment_ids: `${referralLetterData.id};${mhcpData.id}` // Semicolon-separated file IDs
      },
      associations: [
        {
          to: {
            id: dealData.id
          },
          types: [
            {
              associationCategory: 'HUBSPOT_DEFINED',
              associationTypeId: 214 // Note-to-Deal association
            }
          ]
        },
        {
          to: {
            id: contactId
          },
          types: [
            {
              associationCategory: 'HUBSPOT_DEFINED',
              associationTypeId: 202 // Note-to-Contact association
            }
          ]
        }
      ]
    };

    console.log('Note payload:', JSON.stringify(notePayload, null, 2));

    const createNoteResponse = await fetch(
      `https://api.hubapi.com/crm/v3/objects/notes`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(notePayload)
      }
    );

    const noteResponseText = await createNoteResponse.text();
    
    if (!createNoteResponse.ok) {
      console.error(`Failed to create note. Status: ${createNoteResponse.status}`);
      console.error(`Error response: ${noteResponseText}`);
      
      // Try alternative approach using Engagements API v1
      console.log('Attempting fallback using Engagements API v1...');
      
      const engagementPayload = {
        engagement: {
          active: true,
          type: "NOTE",
          timestamp: Date.now()
        },
        associations: {
          contactIds: [contactId],
          dealIds: [dealData.id]
        },
        attachments: [
          {
            id: referralLetterData.id
          },
          {
            id: mhcpData.id
          }
        ],
        metadata: {
          body: `GP Referral Documents:\n\nReferral Letter: ${files.referralLetter.filename}\nMHCP: ${files.mhcp.filename}\n\nReferral from Dr. ${fields.gpName} for ${fields.patientName}`
        }
      };
      
      console.log('Engagement v1 payload:', JSON.stringify(engagementPayload, null, 2));
      
      const engagementResponse = await fetch(
        'https://api.hubapi.com/engagements/v1/engagements',
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(engagementPayload)
        }
      );
      
      const engagementResponseText = await engagementResponse.text();
      
      if (engagementResponse.ok) {
        console.log('Successfully created engagement with attachments using v1 API');
        const engagementData = JSON.parse(engagementResponseText);
        console.log(`Engagement ID: ${engagementData.engagement.id}`);
      } else {
        console.error(`Failed to create engagement v1. Status: ${engagementResponse.status}`);
        console.error(`Error response: ${engagementResponseText}`);
      }
    } else {
      const noteData = JSON.parse(noteResponseText);
      console.log(`Note created successfully with ID: ${noteData.id}`);
      console.log('File attachments should now be visible on both the deal and contact records');
    }

    console.log('GP Referral processed successfully');
    console.log(`Summary: Contact ID: ${contactId}, Deal ID: ${dealData.id}`);
    console.log(`Files attached: ${files.referralLetter.filename}, ${files.mhcp.filename}`);

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
    console.error('Stack trace:', error.stack);
    
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: 'Failed to process referral',
        message: error.message,
        details: process.env.NODE_ENV === 'development' ? error.stack : undefined
      })
    };
  }
};