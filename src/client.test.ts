import { http } from "msw";
import { describe, it, expect, beforeEach } from "vitest";

import PremiumizeClient, { PremiumizeError } from "./index";
import { server } from "./test/setup";

describe("PremiumizeClient", () => {
  let client: PremiumizeClient;

  beforeEach(() => {
    client = PremiumizeClient.create("test-api-key");
  });

  describe("constructor", () => {
    it("should create a client with default config", () => {
      expect(client).toBeInstanceOf(PremiumizeClient);
    });

    it("should create a client with custom config", () => {
      const customClient = PremiumizeClient.create("test-api-key", {
        baseUrl: "https://custom.api.com",
        verboseLogging: false,
        obfuscateApiKeysInLogs: false,
      });
      expect(customClient).toBeInstanceOf(PremiumizeClient);
    });
  });

  describe("accountInfo", () => {
    it("should fetch account information", async () => {
      const result = await client.accountInfo();

      expect(result).toEqual({
        customer_id: 12345,
        premium_until: 1640995200,
        limit_used: 0.5,
        space_used: 1073741824,
      });
    });

    it("should handle API errors", async () => {
      server.use(
        http.get("https://www.premiumize.me/api/account/info", ({ request }) => {
          return new Response(JSON.stringify({ status: "error", message: "Invalid API key" }), {
            status: 400,
            headers: { "Content-Type": "application/json" },
          });
        }),
      );

      await expect(client.accountInfo()).rejects.toThrow(PremiumizeError);
    });
  });

  describe("listFolder", () => {
    it("should list folder contents", async () => {
      const result = await client.listFolder();

      expect(result.content).toHaveLength(2);
      expect(result.content[0]).toEqual({
        id: "folder1",
        name: "Test Folder",
        type: "folder",
      });
      expect(result.content[1]).toEqual({
        id: "file1",
        name: "test-file.txt",
        type: "file",
        size: 1024,
        mime_type: "text/plain",
        link: "https://example.com/file1",
      });
      expect(result.name).toBe("Root");
      expect(result.parent_id).toBe("");
      expect(result.folder_id).toBe("root");
    });

    it("should list folder contents with breadcrumbs", async () => {
      server.use(
        http.get("https://www.premiumize.me/api/folder/list", ({ request }) => {
          return Response.json({
            content: [],
            name: "Test",
            parent_id: "parent",
            folder_id: "test",
            breadcrumbs: [
              { id: "root", name: "Root" },
              { id: "parent", name: "Parent" },
            ],
          });
        }),
      );

      const result = await client.listFolder({ includebreadcrumbs: true });

      expect(result.breadcrumbs).toHaveLength(2);
      expect(result.breadcrumbs?.[0]).toEqual({ id: "root", name: "Root" });
    });
  });

  describe("createFolder", () => {
    it("should create a folder", async () => {
      const result = await client.createFolder({ name: "New Folder" });

      expect(result.id).toBe("new-folder-id");
    });
  });

  describe("renameFolder", () => {
    it("should rename a folder", async () => {
      // Add a mock handler for rename folder
      server.use(
        http.post("https://www.premiumize.me/api/folder/rename", ({ request }) => {
          return new Response(JSON.stringify({ message: "Folder renamed successfully" }), {
            status: 200,
            headers: { "Content-Type": "application/json" },
          });
        }),
      );

      const result = await client.renameFolder({
        id: "folder-id",
        name: "New Folder Name",
      });

      expect(result.message).toBe("Folder renamed successfully");
    });
  });

  describe("listAllItems", () => {
    it("should list all items", async () => {
      const result = await client.listAllItems();

      expect(result.files).toHaveLength(1);
      expect(result.files[0]).toEqual({
        id: "file1",
        name: "test-file.txt",
        path: "/test-file.txt",
        created_at: 1640995200,
        size: 1024,
        mime_type: "text/plain",
        virus_scan: "ok",
      });
    });
  });

  describe("error handling", () => {
    it("should throw PremiumizeError for API errors", async () => {
      server.use(
        http.get("https://www.premiumize.me/api/folder/list", ({ request }) => {
          return new Response(JSON.stringify({ status: "error", message: "Invalid folder ID" }), {
            status: 400,
            headers: { "Content-Type": "application/json" },
          });
        }),
      );

      await expect(client.listFolder({ id: "invalid" })).rejects.toThrow(PremiumizeError);
    });

    it("should throw PremiumizeError for network errors", async () => {
      server.use(
        http.get("https://www.premiumize.me/api/folder/list", ({ request }) => {
          // Simulate network error
          return Promise.reject(new Error("Network error"));
        }),
      );

      await expect(client.listFolder()).rejects.toThrow(PremiumizeError);
    });
  });

  describe("request validation", () => {
    it("should throw error when API key is empty", async () => {
      const clientWithEmptyKey = PremiumizeClient.create("");

      await expect(clientWithEmptyKey.accountInfo()).rejects.toThrow("API key is required");
    });
  });
});
