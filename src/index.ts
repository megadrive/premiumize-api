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
  AccountInfoSchema,
  CreateTransferResponseSchema,
  ListTransfersResponseSchema,
  ListFolderResponseSchema,
  DeleteTransferResponseSchema,
  CreateFolderResponseSchema,
  DeleteFolderResponseSchema,
} from "./types";

export class PremiumizeClient {
  private client: AxiosInstance;
  private config: PremiumizeConfig;

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
}

export default PremiumizeClient;
