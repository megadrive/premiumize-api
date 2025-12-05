import { http } from "msw";
import { setupServer } from "msw/node";
import { beforeAll, afterEach, afterAll } from "vitest";

// Setup MSW server
export const server = setupServer(
  // Account info endpoint
  http.get("https://www.premiumize.me/api/account/info", ({ request }) => {
    return Response.json({
      customer_id: 12345,
      premium_until: 1640995200,
      limit_used: 0.5,
      space_used: 1073741824,
    });
  }),

  // Folder list endpoint
  http.get("https://www.premiumize.me/api/folder/list", ({ request }) => {
    return Response.json({
      content: [
        {
          id: "folder1",
          name: "Test Folder",
          type: "folder",
        },
        {
          id: "file1",
          name: "test-file.txt",
          type: "file",
          size: 1024,
          mime_type: "text/plain",
          link: "https://example.com/file1",
        },
      ],
      name: "Root",
      parent_id: "",
      folder_id: "root",
    });
  }),

  // Create folder endpoint
  http.post("https://www.premiumize.me/api/folder/create", ({ request }) => {
    return Response.json({
      id: "new-folder-id",
    });
  }),

  // List all items endpoint
  http.get("https://www.premiumize.me/api/item/listall", ({ request }) => {
    return Response.json({
      files: [
        {
          id: "file1",
          name: "test-file.txt",
          path: "/test-file.txt",
          created_at: 1640995200,
          size: 1024,
          mime_type: "text/plain",
          virus_scan: "ok",
        },
      ],
    });
  }),
);

// Start server before all tests
beforeAll(() => server.listen());

// Close server after all tests
afterAll(() => server.close());

// Reset handlers after each test
afterEach(() => server.resetHandlers());
