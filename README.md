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

```typescript
import { PremiumizeClient } from 'premiumize-api';

const client = new PremiumizeClient({
  apiKey: 'your-api-key-here'
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

- `getAccountInfo()`: Get account information and limits
- `createTransfer(request)`: Create a new transfer from magnet/torrent
- `listTransfers()`: List all active transfers
- `deleteTransfer(id)`: Delete a transfer
- `listFolder(folderId?)`: List contents of a folder
- `createFolder(name, parentId?)`: Create a new folder
- `deleteFolder(id)`: Delete a folder

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