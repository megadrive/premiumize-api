import axios from "axios";
import { PremiumizeClient } from "../src";

// Mock Axios
jest.mock("axios");
const mockedAxios = axios as jest.Mocked<typeof axios>;

// Mock axios.isAxiosError
(mockedAxios.isAxiosError as any) = jest.fn();

describe("PremiumizeClient", () => {
  let client: PremiumizeClient;
  let mockAxiosInstance: any;

  beforeEach(() => {
    mockAxiosInstance = {
      post: jest.fn(),
    };
    mockedAxios.create.mockReturnValue(mockAxiosInstance);
    client = new PremiumizeClient({ apiKey: "test-key" });
    jest.clearAllMocks();
  });

  it("should create a client instance", () => {
    expect(client).toBeInstanceOf(PremiumizeClient);
  });

  describe("getAccountInfo", () => {
    it("should return account info on success", async () => {
      const mockResponse = {
        data: {
          status: "success",
          customer_id: "123",
          premium_until: 1640995200,
          limit_used: 100,
          limit_total: 1000,
          space_used: 500,
          space_total: 1000,
        },
      };
      mockAxiosInstance.post.mockResolvedValue(mockResponse);

      const result = await client.getAccountInfo();
      expect(result.customer_id).toBe("123");
      expect(result.premium_until).toBe(1640995200);
    });

    it("should throw error on API failure", async () => {
      const mockResponse = {
        data: { status: "error", message: "Invalid API key" },
      };
      mockAxiosInstance.post.mockResolvedValue(mockResponse);

      await expect(client.getAccountInfo()).rejects.toThrow("Invalid API key");
    });

    it("should throw error on validation failure", async () => {
      const mockResponse = {
        data: {
          status: "success",
          customer_id: "123",
          // Missing required fields to trigger Zod validation error
        },
      };
      mockAxiosInstance.post.mockResolvedValue(mockResponse);

      await expect(client.getAccountInfo()).rejects.toThrow(
        "API response validation failed"
      );
    });
  });

  describe("createTransfer", () => {
    it("should create transfer successfully", async () => {
      const mockResponse = {
        data: {
          id: "transfer-123",
          name: "Test Transfer",
          status: "running",
        },
      };
      mockAxiosInstance.post.mockResolvedValue(mockResponse);

      const result = await client.createTransfer({
        src: "magnet:?xt=urn:btih:test",
      });
      expect(result.id).toBe("transfer-123");
      expect(result.name).toBe("Test Transfer");
    });

    it("should create transfer with folder_id", async () => {
      const mockResponse = {
        data: {
          id: "transfer-123",
          name: "Test Transfer",
          status: "running",
        },
      };
      mockAxiosInstance.post.mockResolvedValue(mockResponse);

      await client.createTransfer({
        src: "magnet:?xt=urn:btih:test",
        folder_id: "folder-456",
      });

      expect(mockAxiosInstance.post).toHaveBeenCalledWith(
        "transfer/create",
        null,
        {
          params: {
            apikey: "test-key",
            src: "magnet:?xt=urn:btih:test",
            folder_id: "folder-456",
          },
        }
      );
    });
  });

  describe("listTransfers", () => {
    it("should return list of transfers", async () => {
      const mockResponse = {
        data: {
          status: "success",
          transfers: [
            {
              id: "transfer-1",
              name: "Transfer 1",
              message: "",
              status: "finished",
              progress: 100,
              eta: 0,
              folder_id: "folder-1",
              file_id: "file-1",
            },
          ],
        },
      };
      mockAxiosInstance.post.mockResolvedValue(mockResponse);

      const result = await client.listTransfers();
      expect(result.transfers).toHaveLength(1);
      expect(result.transfers[0].id).toBe("transfer-1");
    });
  });

  describe("deleteTransfer", () => {
    it("should delete transfer successfully", async () => {
      const mockResponse = {
        data: {
          status: "success",
        },
      };
      mockAxiosInstance.post.mockResolvedValue(mockResponse);

      const result = await client.deleteTransfer("transfer-123");
      expect(result.status).toBe("success");
    });
  });

  describe("listFolder", () => {
    it("should list folder contents", async () => {
      const mockResponse = {
        data: {
          status: "success",
          content: [
            {
              id: "folder-1",
              name: "Test Folder",
              parent_id: "",
              type: "folder",
            },
            {
              id: "file-1",
              name: "test.txt",
              size: 1024,
              created_at: 1640995200,
              type: "file",
              mime_type: "text/plain",
              link: "https://example.com/file",
            },
          ],
          name: "root",
          parent_id: "",
        },
      };
      mockAxiosInstance.post.mockResolvedValue(mockResponse);

      const result = await client.listFolder();
      expect(result.content).toHaveLength(2);
      expect(result.content[0].type).toBe("folder");
      expect(result.content[1].type).toBe("file");
    });

    it("should list specific folder", async () => {
      const mockResponse = {
        data: {
          status: "success",
          content: [],
          name: "Test Folder",
          parent_id: "root",
        },
      };
      mockAxiosInstance.post.mockResolvedValue(mockResponse);

      await client.listFolder("folder-123");

      expect(mockAxiosInstance.post).toHaveBeenCalledWith("folder/list", null, {
        params: {
          apikey: "test-key",
          id: "folder-123",
        },
      });
    });
  });

  describe("createFolder", () => {
    it("should create folder successfully", async () => {
      const mockResponse = {
        data: {
          status: "success",
          data: { id: "new-folder-123" },
        },
      };
      mockAxiosInstance.post.mockResolvedValue(mockResponse);

      const result = await client.createFolder("New Folder");
      expect(result.status).toBe("success");
      expect(result.data?.id).toBe("new-folder-123");
    });

    it("should create folder with parent", async () => {
      const mockResponse = {
        data: {
          status: "success",
          data: { id: "new-folder-123" },
        },
      };
      mockAxiosInstance.post.mockResolvedValue(mockResponse);

      await client.createFolder("New Folder", "parent-456");

      expect(mockAxiosInstance.post).toHaveBeenCalledWith(
        "folder/create",
        null,
        {
          params: {
            apikey: "test-key",
            name: "New Folder",
            parent_id: "parent-456",
          },
        }
      );
    });
  });

  describe("deleteFolder", () => {
    it("should delete folder successfully", async () => {
      const mockResponse = {
        data: {
          status: "success",
        },
      };
      mockAxiosInstance.post.mockResolvedValue(mockResponse);

      const result = await client.deleteFolder("folder-123");
      expect(result.status).toBe("success");
    });
  });

  describe("error handling", () => {
    it("should handle network errors", async () => {
      const networkError = new Error("Network Error");
      mockAxiosInstance.post.mockRejectedValue(networkError);

      await expect(client.getAccountInfo()).rejects.toThrow("Network Error");
    });

    it("should handle axios errors", async () => {
      const axiosError = {
        isAxiosError: true,
        message: "Request timeout",
      };
      (mockedAxios.isAxiosError as any).mockReturnValue(true);
      mockAxiosInstance.post.mockRejectedValue(axiosError);

      await expect(client.getAccountInfo()).rejects.toThrow(
        "API request failed: Request timeout"
      );
    });
  });
});
