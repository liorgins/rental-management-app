# Document Storage Setup

## Current Implementation

The document management system is now implemented using **Vercel Blob Storage** for file storage with metadata stored in Upstash KV database. This provides efficient, scalable file storage with direct blob URLs.

## Production Setup (Recommended)

For production, you should integrate with a blob storage service. Here are the environment variables you'll need to add to your `.env.local` file:

### Option 1: Vercel Blob Storage

```env
BLOB_READ_WRITE_TOKEN=your-vercel-blob-token
```

### Option 2: AWS S3

```env
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key
AWS_REGION=your-region
AWS_BUCKET_NAME=your-bucket-name
```

### Option 3: Google Cloud Storage

```env
GOOGLE_CLOUD_PROJECT_ID=your-project-id
GOOGLE_CLOUD_STORAGE_BUCKET=your-bucket-name
GOOGLE_APPLICATION_CREDENTIALS=path-to-service-account-key.json
```

## File Upload Limitations

### Current (Base64 in KV)

- **File Size Limit**: ~10MB (due to KV storage limits)
- **Performance**: Slower for large files
- **Storage Cost**: Higher (base64 encoding increases size by ~33%)

### With Blob Storage

- **File Size Limit**: Much larger (typically 100MB+)
- **Performance**: Faster uploads/downloads
- **Storage Cost**: Lower cost per MB

## Security Considerations

1. **File Type Validation**: Currently accepts common document types
2. **File Size Limits**: Implement client and server-side size checks
3. **Access Control**: Documents are scoped to units or global
4. **Content Scanning**: Consider adding virus/malware scanning for production

## Usage

### Upload Documents

- Navigate to any unit page
- Click "Upload Document"
- Fill in document details (name, type, scope)
- Select file to upload
- Click "Upload Document"

### View/Download Documents

- **View**: Click the eye icon to open in a new tab
- **Download**: Click the download icon to save the file
- **Edit**: Click the edit icon to modify document metadata
- **Delete**: Click the trash icon to remove the document

### Document Types Supported

- Contract
- Insurance
- Maintenance
- Tax
- Invoice
- Receipt
- Other

### Scope Options

- **Global**: Available across all units
- **Unit**: Associated with a specific unit

## API Endpoints

- `GET /api/documents` - List all documents (with optional filters)
- `POST /api/documents` - Upload a new document
- `GET /api/documents/[id]` - Get document metadata
- `PUT /api/documents/[id]` - Update document metadata
- `DELETE /api/documents/[id]` - Delete a document
- `GET /api/documents/[id]/download` - Download/view document file
