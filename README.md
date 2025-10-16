# Premiumize API Library

A scalable, easy-to-use TypeScript library for interacting with the Premiumize.me API.

Disclaimed: Entirely vibe-coded. I have vetted the implementation but yeah. FYI.

## Installation

```bash
npm install premiumize-api
# or
pnpm add premiumize-api
```

## Usage

### Quick Start

```typescript
import { PremiumizeClient } from 'premiumize-api';

// Using static method (recommended)
const client = PremiumizeClient.create('your-api-key-here');

// Or using constructor
const client = new PremiumizeClient({
  apiKey: 'your-api-key-here',
  baseUrl: 'https://custom-api-endpoint.com' // optional
});

// Get account info
const account = await client.getAccountInfo();
console.log(account);

// Create a transfer
const transfer = await client.createTransfer({
  src: 'magnet:?xt=urn:btih:...'
});
console.log(transfer);

// List transfers
const transfers = await client.listTransfers();
console.log(transfers);

// List folder contents
const folder = await client.listFolder();
console.log(folder);
```

## API Methods

### Account
- `getAccountInfo()`: Get account information and limits

### Transfers
- `createTransfer(request)`: Create a new transfer from magnet/torrent
- `listTransfers()`: List all active transfers
- `deleteTransfer(id)`: Delete a transfer
- `createDirectDownload(request)`: Create a direct download link
- `clearFinishedTransfers()`: Clear all finished transfers

### Folders
- `listFolder(folderId?)`: List contents of a folder
- `createFolder(name, parentId?)`: Create a new folder
- `deleteFolder(id)`: Delete a folder
- `renameFolder(id, name)`: Rename a folder
- `pasteFolder(id, items[])`: Paste multiple files/folders into a folder
- `getUploadInfo(folderId?)`: Get upload info for file uploads
- `searchFolder(query, folderId?)`: Search files and folders

### Items (Files)
- `listAllItems()`: List all files across all folders
- `deleteItem(id)`: Delete a file
- `renameItem(id, name)`: Rename a file
- `getItemDetails(id)`: Get detailed information about a file

### Zip
- `generateZip(items[], name?)`: Generate a zip file from multiple items

### Cache
- `checkCache(urls[])`: Check if URLs are available in Premiumize cache

### Services
- `listServices()`: Get list of supported services and domains

## Configuration

Pass your API key when creating the client. You can get your API key from your Premiumize account settings.

## Error Handling

All methods throw errors for API failures. Wrap calls in try-catch blocks:

```typescript
try {
  const account = await client.getAccountInfo();
} catch (error) {
  console.error('API Error:', error.message);
}
```

## Features

- **Type Safety**: Full TypeScript support with strict typing
- **Schema Validation**: Runtime validation using Zod schemas to ensure API responses match expected structure
- **Error Handling**: Comprehensive error handling with descriptive messages
- **Easy Configuration**: Simple setup with API key and optional custom base URL

## Schema Validation

All API responses are automatically validated against Zod schemas to ensure type safety at runtime. If the API returns unexpected data, the library will throw a descriptive validation error:

```typescript
try {
  const account = await client.getAccountInfo();
  // account is guaranteed to match AccountInfo interface
} catch (error) {
  if (error.message.includes('validation failed')) {
    console.error('API response format changed:', error.message);
  }
}
```

## Development

```bash
# Install dependencies
pnpm install

# Build
pnpm run build

# Test
pnpm test

# Lint
pnpm run lint
```

## License

ISC