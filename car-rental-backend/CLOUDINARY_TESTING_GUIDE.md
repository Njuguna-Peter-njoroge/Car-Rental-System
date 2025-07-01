# Cloudinary Testing Guide

## Prerequisites

1. **Set up Cloudinary Environment Variables**
   Create a `.env` file in the `car-rental-backend` directory with:
   ```
   CLOUDINARY_CLOUD_NAME=your-cloud-name
   CLOUDINARY_API_KEY=your-api-key
   CLOUDINARY_API_SECRET=your-api-secret
   ```

2. **Start the Backend Server**
   ```bash
   cd car-rental-backend
   npm run start:dev
   ```

## Testing Steps

### Step 1: Test Basic Connectivity
**File:** `Restclient/cloudinary-simple-test.http`
**Request:** `GET http://localhost:3000/upload/test`

**Expected Response:**
```json
{
  "success": true,
  "message": "Cloudinary service is working",
  "timestamp": "2024-01-01T12:00:00.000Z"
}
```

**If this fails:**
- Check your `.env` file has correct Cloudinary credentials
- Restart the server after updating `.env`
- Check server logs for error messages

### Step 2: Test File Upload (No Authentication Required)
**File:** `Restclient/cloudinary-simple-test.http`
**Request:** `POST http://localhost:3000/upload/test-upload`

**Expected Response:**
```json
{
  "success": true,
  "message": "Test upload successful",
  "data": {
    "public_id": "car-rental-app/documents/general/document_1234567890_abc123",
    "secure_url": "https://res.cloudinary.com/your-cloud/image/upload/...",
    "url": "http://res.cloudinary.com/your-cloud/image/upload/...",
    "original_filename": "test.png",
    "bytes": 95,
    "format": "png",
    "resource_type": "image",
    "created_at": "2024-01-01T12:00:00.000Z",
    "width": 1,
    "height": 1,
    "folder": "car-rental-app"
  }
}
```

### Step 3: Get Authentication Token
Before testing authenticated endpoints, you need a JWT token:

1. **Register a user:**
   ```http
   POST http://localhost:3000/auth/register
   Content-Type: application/json

   {
     "name": "Test User",
     "email": "test@example.com",
     "password": "password123"
   }
   ```

2. **Login to get token:**
   ```http
   POST http://localhost:3000/auth/login
   Content-Type: application/json

   {
     "email": "test@example.com",
     "password": "password123"
   }
   ```

3. **Copy the token from the response and update:**
   - `Restclient/http-client.env.json` file
   - Replace `"your-jwt-token-here"` with your actual token

### Step 4: Test Authenticated Endpoints

#### Profile Image Upload
**Request:** `POST http://localhost:3000/upload/profile-image`
**Headers:** `Authorization: Bearer {{authToken}}`

#### Document Upload
**Request:** `POST http://localhost:3000/upload/document`
**Headers:** `Authorization: Bearer {{authToken}}`

#### File Deletion
**Request:** `DELETE http://localhost:3000/upload/delete/{{publicId}}`
**Headers:** `Authorization: Bearer {{authToken}}`

## Troubleshooting

### Common Issues:

1. **"Cloudinary service test failed"**
   - Check `.env` file has correct credentials
   - Verify Cloudinary account is active
   - Check server logs for detailed error

2. **"No file provided"**
   - Ensure you're using the correct file path
   - Check the `test-image.png` file exists in the backend directory

3. **"Upload failed"**
   - Check file size (should be under limits)
   - Verify file format is allowed
   - Check Cloudinary dashboard for upload status

4. **Authentication errors**
   - Ensure you have a valid JWT token
   - Check token hasn't expired
   - Verify token is properly formatted in Authorization header

### Verification Steps:

1. **Check Cloudinary Dashboard**
   - Log into your Cloudinary account
   - Go to Media Library
   - Verify uploaded files appear

2. **Check Server Logs**
   - Look for Cloudinary-related log messages
   - Check for any error messages

3. **Test URL Access**
   - Copy the `secure_url` from upload response
   - Open in browser to verify image loads

## Success Indicators

✅ **Connectivity Test:** Returns success message
✅ **Upload Test:** Returns Cloudinary URLs and metadata
✅ **Dashboard:** Files appear in Cloudinary Media Library
✅ **URL Access:** Images load in browser
✅ **Authentication:** Protected endpoints work with valid token

## Next Steps

Once basic testing passes:
1. Test with larger files
2. Test different file formats
3. Test image transformations
4. Test file deletion
5. Integrate with your application features 