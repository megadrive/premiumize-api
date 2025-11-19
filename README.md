# @almosteffective/premiumize-api

A TypeScript library for interacting with the Premiumize.me API with full type safety and runtime validation.

## Installation

```bash
npm install @almosteffective/premiumize-api
# or
pnpm add @almosteffective/premiumize-api
```

## Quick Start

```typescript
import { PremiumizeClient } from '@almosteffective/premiumize-api';

// Create a client instance (recommended method)
const client = PremiumizeClient.create('your-api-key-here');

// Or using the constructor directly
const client = new PremiumizeClient({
  apiKey: 'your-api-key-here',
  baseUrl: 'https://custom-api-endpoint.com' // optional
});

// Get account info
const account = await client.accountInfo();
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
- `accountInfo()`: Get account information and limits

### Transfers
- `createTransfer(options)`: Create a new transfer from magnet/torrent or NZB container
- `listTransfers()`: List all transfers
- `deleteTransfers(options)`: Delete transfers
- `clearTransfers()`: Clear all finished transfers

### Folders
- `listFolder(options?)`: List contents of a folder
- `createFolder(options)`: Create a new folder
- `deleteFolder(options)`: Delete a folder
- `renameFolder(options)`: Rename a folder
- `searchFolder(options)`: Search files and folders

### Items (Files)
- `listAllItems()`: List all files across all folders
- `deleteItem(options)`: Delete a file
- `renameItem(options)`: Rename a file
- `getItemDetails(options)`: Get detailed information about a file

### Zip
- `generateZip(options)`: Generate a zip file from multiple items

### Cache
- `checkCache(options)`: Check if URLs are available in Premiumize cache

### Services
- `listServices()`: Get list of supported services and domains

## Detailed Usage Examples

### Working with Folders

```typescript
// List root folder
const rootFolder = await client.listFolder();

// List a specific folder with breadcrumbs
const folderWithBreadcrumbs = await client.listFolder({
  id: 'folder-id',
  includebreadcrumbs: true
});

// Create a new folder
const newFolder = await client.createFolder({
  name: 'My Downloads',
  parent_id: 'parent-folder-id'
});

// Rename a folder
await client.renameFolder({
  id: 'folder-id',
  name: 'New Folder Name'
});

// Delete a folder
await client.deleteFolder({
  id: 'folder-id'
});

// Search for items
const searchResults = await client.searchFolder({
  query: 'movie title'
});
```

### Managing Transfers

```typescript
// Create a new transfer
const transfer = await client.createTransfer({
  src: 'magnet:?xt=urn:btih:...',
  folder_id: 'destination-folder-uuid'
});

// List all transfers
const transfers = await client.listTransfers();

// Delete a specific transfer
await client.deleteTransfers({
  id: 'transfer-id'
});

// Clear all finished transfers
await client.clearTransfers();
```

### Working with Files

```typescript
// List all files across all folders
const allFiles = await client.listAllItems();

// Get detailed information about a file
const fileDetails = await client.getItemDetails({
  id: 'file-id'
});

// Rename a file
await client.renameItem({
  id: 'file-id',
  name: 'New File Name.ext'
});

// Delete a file
await client.deleteItem({
  id: 'file-id'
});
```

### Utilities

```typescript
// Check if URLs are in cache
const cacheCheck = await client.checkCache({
  items: ['https://example.com/file1.zip', 'https://example.com/file2.zip']
});

// Generate a zip file
const zipFile = await client.generateZip({
  files: ['file-id-1', 'file-id-2'],
  folders: ['folder-id-1']
});

// Get supported services
const services = await client.listServices();
```

## Error Handling

The library provides comprehensive error handling with custom error types:

```typescript
try {
  const result = await client.accountInfo();
  console.log(result);
} catch (error) {
  if (error instanceof PremiumizeError) {
    console.error('Premiumize API Error:', error.message);
    // Additional error details are available in error.internalError
  } else if (error instanceof HTTPError) {
    console.error('HTTP Request Error:', error.message);
  } else {
    console.error('Unexpected Error:', error.message);
  }
}
```

## Configuration

### Required Configuration

Only an API key is required to use the library. You can obtain your API key from your [Premiumize account settings](https://www.premiumize.me/account).

### Optional Configuration

You can optionally provide a custom base URL if you're using a proxy or different endpoint:

```typescript
const client = new PremiumizeClient({
  apiKey: 'your-api-key-here',
  baseUrl: 'https://my-proxy.com/premiumize-api'
});
```

## Features

- **Type Safety**: Full TypeScript support with strict typing
- **Schema Validation**: Runtime validation using Zod schemas to ensure API responses match expected structure
- **Error Handling**: Comprehensive error handling with descriptive messages
- **Easy Configuration**: Simple setup with API key and optional custom base URL

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

MIT
