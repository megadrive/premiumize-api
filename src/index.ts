import axios, { AxiosInstance } from "axios";
import { z } from "zod";
import {
  PremiumizeConfig,
  AccountInfo,
  CreateTransferRequest,
  CreateTransferResponse,
  ListTransfersResponse,
  ListFolderResponse,
  ApiResponse,
  ListAllItemsResponse,
  UploadInfoResponse,
  SearchFolderResponse,
  ItemDetailsResponse,
  DirectDownloadRequest,
  DirectDownloadResponse,
  GenerateZipResponse,
  CheckCacheResponse,
  ListServicesResponse,
  AccountInfoSchema,
  CreateTransferResponseSchema,
  ListTransfersResponseSchema,
  ListFolderResponseSchema,
  DeleteTransferResponseSchema,
  CreateFolderResponseSchema,
  DeleteFolderResponseSchema,
  RenameFolderResponseSchema,
  PasteFolderResponseSchema,
  SearchFolderResponseSchema,
  DeleteItemResponseSchema,
  RenameItemResponseSchema,
  ItemDetailsResponseSchema,
  DirectDownloadResponseSchema,
  ClearFinishedTransfersResponseSchema,
  GenerateZipResponseSchema,
  CheckCacheResponseSchema,
  ListServicesResponseSchema,
  ListAllItemsResponseSchema,
} from "./types";

export class PremiumizeClient {
  private client: AxiosInstance;
  private config: PremiumizeConfig;

  static create(apiKey: string, baseUrl?: string): PremiumizeClient {
    return new PremiumizeClient({ apiKey, baseUrl });
  }

  constructor(config: PremiumizeConfig) {
    this.config = {
      baseUrl: "https://www.premiumize.me/api",
      ...config,
    };

    this.client = axios.create({
      baseURL: this.config.baseUrl,
      timeout: 10000,
    });
  }

  private async request<T>(
    endpoint: string,
    params: Record<string, any> = {},
    schema?: z.ZodTypeAny
  ): Promise<T> {
    try {
      const response = await this.client.post(endpoint, null, {
        params: {
          apikey: this.config.apiKey,
          ...params,
        },
      });

      if (response.data.status === "error") {
        throw new Error(response.data.message || "API request failed");
      }

      // Validate response with Zod schema if provided
      if (schema) {
        const validationResult = schema.safeParse(response.data);
        if (!validationResult.success) {
          throw new Error(
            `API response validation failed: ${validationResult.error.message}`
          );
        }
        return validationResult.data as T;
      }

      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(`API request failed: ${error.message}`);
      }
      throw error;
    }
  }

  async getAccountInfo(): Promise<AccountInfo> {
    return this.request<AccountInfo>("account/info", {}, AccountInfoSchema);
  }

  async createTransfer(
    request: CreateTransferRequest
  ): Promise<CreateTransferResponse> {
    return this.request<CreateTransferResponse>(
      "transfer/create",
      request,
      CreateTransferResponseSchema
    );
  }

  async listTransfers(): Promise<ListTransfersResponse> {
    return this.request<ListTransfersResponse>(
      "transfer/list",
      {},
      ListTransfersResponseSchema
    );
  }

  async deleteTransfer(id: string): Promise<ApiResponse<null>> {
    return this.request<ApiResponse<null>>(
      "transfer/delete",
      { id },
      DeleteTransferResponseSchema
    );
  }

  async listFolder(folderId?: string): Promise<ListFolderResponse> {
    const params = folderId ? { id: folderId } : {};
    return this.request<ListFolderResponse>(
      "folder/list",
      params,
      ListFolderResponseSchema
    );
  }

  async createFolder(
    name: string,
    parentId?: string
  ): Promise<ApiResponse<{ id: string }>> {
    const params: any = { name };
    if (parentId) params.parent_id = parentId;
    return this.request<ApiResponse<{ id: string }>>(
      "folder/create",
      params,
      CreateFolderResponseSchema
    );
  }

  async deleteFolder(id: string): Promise<ApiResponse<null>> {
    return this.request<ApiResponse<null>>(
      "folder/delete",
      { id },
      DeleteFolderResponseSchema
    );
  }

  async listAllItems(): Promise<ListAllItemsResponse> {
    return this.request<ListAllItemsResponse>(
      "item/listall",
      {},
      ListAllItemsResponseSchema
    );
  }

  // Folder operations
  async renameFolder(id: string, name: string): Promise<ApiResponse<null>> {
    return this.request<ApiResponse<null>>(
      "folder/rename",
      { id, name },
      RenameFolderResponseSchema
    );
  }

  async pasteFolder(id: string, items: string[]): Promise<ApiResponse<null>> {
    return this.request<ApiResponse<null>>(
      "folder/paste",
      { id, items: items.join(",") },
      PasteFolderResponseSchema
    );
  }

  async getUploadInfo(folderId?: string): Promise<UploadInfoResponse> {
    const params = folderId ? { id: folderId } : {};
    return this.request<UploadInfoResponse>("folder/uploadinfo", params);
  }

  async searchFolder(
    query: string,
    folderId?: string
  ): Promise<SearchFolderResponse> {
    const params: any = { q: query };
    if (folderId) params.folder_id = folderId;
    return this.request<SearchFolderResponse>(
      "folder/search",
      params,
      SearchFolderResponseSchema
    );
  }

  // Item operations
  async deleteItem(id: string): Promise<ApiResponse<null>> {
    return this.request<ApiResponse<null>>(
      "item/delete",
      { id },
      DeleteItemResponseSchema
    );
  }

  async renameItem(id: string, name: string): Promise<ApiResponse<null>> {
    return this.request<ApiResponse<null>>(
      "item/rename",
      { id, name },
      RenameItemResponseSchema
    );
  }

  async getItemDetails(id: string): Promise<ItemDetailsResponse> {
    return this.request<ItemDetailsResponse>(
      "item/details",
      { id },
      ItemDetailsResponseSchema
    );
  }

  // Transfer operations
  async createDirectDownload(
    request: DirectDownloadRequest
  ): Promise<DirectDownloadResponse> {
    return this.request<DirectDownloadResponse>(
      "transfer/directdl",
      request,
      DirectDownloadResponseSchema
    );
  }

  async clearFinishedTransfers(): Promise<ApiResponse<null>> {
    return this.request<ApiResponse<null>>(
      "transfer/clearfinished",
      {},
      ClearFinishedTransfersResponseSchema
    );
  }

  // Zip operations
  async generateZip(
    items: string[],
    name?: string
  ): Promise<GenerateZipResponse> {
    const params: any = { items: items.join(",") };
    if (name) params.name = name;
    return this.request<GenerateZipResponse>(
      "zip/generate",
      params,
      GenerateZipResponseSchema
    );
  }

  // Cache operations
  async checkCache(urls: string[]): Promise<CheckCacheResponse> {
    return this.request<CheckCacheResponse>(
      "cache/check",
      { items: urls.join(",") },
      CheckCacheResponseSchema
    );
  }

  // Services operations
  async listServices(): Promise<ListServicesResponse> {
    return this.request<ListServicesResponse>(
      "services/list",
      {},
      ListServicesResponseSchema
    );
  }
}

export default PremiumizeClient;
