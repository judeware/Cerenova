# Cerenova Technical Documentation

## GP Referral System

### Overview
The GP Referral System allows general practitioners to refer patients to Cerenova Psychology through a secure web form. The system integrates with HubSpot CRM to manage referrals and automate communication workflows.

### Frontend
- **URL**: `/refer` (or `/refer.html`)
- **File**: `public/refer.html`
- **Features**:
  - Clinical intake form with patient and GP information
  - Secure file upload for referral letters and Mental Health Care Plans (MHCP)
  - Drag-and-drop file upload interface
  - Real-time form validation
  - Success/error messaging

### Backend Function
- **Endpoint**: `/.netlify/functions/process-referral`
- **File**: `netlify/functions/process-referral.js`
- **Method**: POST (multipart/form-data)

### Form Fields

| Field Name | Type | Required | Description |
|------------|------|----------|-------------|
| gpName | string | Yes | Name of the referring GP |
| gpEmail | email | Yes | Email address of the referring GP |
| patientName | string | Yes | Full name of the patient |
| patientDOB | date | Yes | Patient's date of birth |
| patientMobile | string | Yes | Patient's mobile number (10 digits) |
| patientEmail | email | Yes | Patient's email address |
| referralLetter | file | Yes | GP referral letter (PDF, DOC, DOCX, JPG, PNG) |
| mhcp | file | Yes | Mental Health Care Plan document |

### HubSpot Property Mappings

#### Contact Properties (Patient)
| Form Field | HubSpot Property | Type | Description |
|------------|------------------|------|-------------|
| patientEmail | email | string | Contact's email address |
| patientName | firstname, lastname | string | Split into first and last name |
| patientMobile | mobilephone | string | Mobile phone number |

#### Deal Properties
| Property | Value | Description |
|----------|-------|-------------|
| dealname | `GP Referral - {patientName}` | Deal title |
| pipeline | 1620199873 | GP Referrals pipeline ID (hardcoded) |
| dealstage | 2698204656 | Referral Received stage ID (hardcoded) |
| amount | 220 | Initial session value |
| gp_name | {gpName} | Custom property for referring GP |
| gp_email | {gpEmail} | Custom property for GP email |
| patient_dob | {patientDOB} | Patient date of birth (timestamp) |
| gp_referral_letter_url | {referralLetterUrl} | URL to uploaded referral letter |
| mhcp_url | {mhcpUrl} | URL to uploaded MHCP document |
| description | Referral details | Formatted referral information |

### File Upload Specifications
- **Maximum file size**: 10MB per file
- **Accepted formats**: PDF, DOC, DOCX, JPG, JPEG, PNG
- **Storage**: HubSpot File Manager
- **Access level**: PUBLIC_NOT_INDEXABLE (secure but accessible via link)

### API Integration

#### Environment Variables Required
```env
HUBSPOT_ACCESS_TOKEN=your-hubspot-private-app-access-token
```

#### HubSpot API Endpoints Used
1. **File Upload**: 
   - `POST /files/v3/files` - Upload file with multipart/form-data
   - Options: `access: 'PUBLIC_INDEXABLE'`, `ttl: 'P6M'`, `folderPath: '/GP Referrals'`

2. **Contact Management**:
   - `POST /crm/v3/objects/contacts/search` - Search existing contacts
   - `POST /crm/v3/objects/contacts` - Create new contact
   - `PATCH /crm/v3/objects/contacts/{id}` - Update contact

3. **Deal Management**:
   - `GET /crm/v3/pipelines/deals` - Get pipelines
   - `POST /crm/v3/objects/deals` - Create deal
   - `PUT /crm/v3/objects/deals/{dealId}/associations/contacts/{contactId}/3` - Associate deal with contact

### Email Automation
The system triggers automated emails through HubSpot workflows:

1. **Referral Received Email** (to patient):
   - Triggered when a new deal enters the "Referral Received" stage
   - Confirms receipt of referral
   - Provides next steps information

2. **GP Confirmation Email** (to referring GP):
   - Triggered alongside patient email
   - Confirms successful referral submission
   - Includes patient details for GP records

### Error Handling

#### Client-Side Validation
- Required field validation
- Email format validation
- Phone number format validation (10 digits)
- File size validation (< 10MB)
- File type validation

#### Server-Side Error Responses
| Status Code | Error | Description |
|-------------|-------|-------------|
| 400 | Missing required field | One or more required fields not provided |
| 400 | Missing required documents | Referral letter or MHCP not uploaded |
| 405 | Method Not Allowed | Non-POST request to endpoint |
| 500 | HUBSPOT_ACCESS_TOKEN not configured | Missing environment variable |
| 500 | Failed to process referral | HubSpot API error or other server error |

### Security Considerations
1. **File Validation**: Server-side validation of file types and sizes
2. **Data Sanitization**: All inputs are sanitized before processing
3. **Secure Storage**: Files stored in HubSpot with restricted access
4. **HTTPS Only**: All communications over secure connections
5. **Environment Variables**: Sensitive credentials stored as environment variables

### Testing the System
1. Ensure `HUBSPOT_ACCESS_TOKEN` is set in Netlify environment variables
2. Verify "GP Referrals" pipeline exists in HubSpot
3. Ensure custom properties exist in HubSpot:
   - Deal: `gp_name`, `gp_email`, `patient_dob`, `gp_referral_letter_url`, `mhcp_url`
4. Test with valid GP and patient information
5. Verify files upload successfully to HubSpot
6. Check that contact and deal are created in HubSpot
7. Confirm automated emails are triggered

### Future Enhancements
- [ ] Add support for additional document types
- [ ] Implement bulk referral uploads
- [ ] Add referral status tracking page
- [ ] Enable direct integration with practice management systems
- [ ] Add multi-language support