import axios, { AxiosInstance } from "axios";
import { z } from "zod";

import { PremiumizeError } from "./errors";
import * as P from "./types";
import { obfuscateString } from "./util";

type RequestArguments = {
  endpoint: string;
  params: Record<string, any>;
  schema?: z.ZodTypeAny;
  method?: "get" | "post";
};

export class PremiumizeClient {
  private client: AxiosInstance;
  private config: P.PremiumizeConfig;
  private verboseLog = (...args: unknown[]) => {
    if (this.config.verboseLogging) {
      console.log(...args);
    }
  };

  static create(apiKey: string, baseUrl?: string): PremiumizeClient {
    return new PremiumizeClient({ apiKey, baseUrl });
  }

  constructor(config: P.PremiumizeConfig) {
    this.config = {
      baseUrl: "https://www.premiumize.me/api",
      ...config,
    };

    this.client = axios.create({
      baseURL: this.config.baseUrl,
      timeout: 10000,
    });
  }

  private async request<T>(opts: RequestArguments): Promise<T> {
    this.verboseLog(
      `Requesting ${opts.endpoint} with ${obfuscateString(this.config.apiKey)}`,
    );
    try {
      let response = await (() => {
        if (opts.method === "post") {
          return this.client.post(opts.endpoint, null, {
            params: {
              apikey: this.config.apiKey,
              ...opts.params,
            },
          });
        }

        return this.client.get(opts.endpoint, {
          params: {
            apikey: this.config.apiKey,
            ...opts.params,
          },
        });
      })();

      this.verboseLog(response.request);

      // API-level error returned in the body
      if (response.data && response.data.status === "error") {
        throw new PremiumizeError(
          response.data.message || "API request failed",
          response.data,
        );
      }

      // Validate response with Zod schema if provided
      if (opts.schema) {
        const validationResult = opts.schema.safeParse(response.data);
        if (!validationResult.success) {
          throw new Error(
            `API response validation failed: ${validationResult.error.message}`,
          );
        }
        return validationResult.data as T;
      }

      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new PremiumizeError(
          `API request failed: ${error.message}`,
          error,
        );
      }
      // Re-throw custom errors (PremiumizeError) or other unexpected errors
      throw error;
    }
  }

  listFolder(
    opts: P.ListFolderRequest = { includebreadcrumbs: false },
  ): Promise<P.ListFolderResponse> {
    return this.request<P.ListFolderResponse>({
      endpoint: "/folder/list",
      params: {
        id: opts.id,
        includebreadcrumbs: opts.includebreadcrumbs,
      },
      schema: P.ListFolderResponse,
    });
  }

  createFolder(opts: P.CreateFolderRequest): Promise<P.CreateFolderResponse> {
    return this.request<P.CreateFolderResponse>({
      endpoint: "/folder/create",
      params: {
        name: opts.name,
        parent_id: opts.parent_id,
      },
      schema: P.CreateFolderResponse,
      method: "post",
    });
  }

  renameFolder(opts: P.RenameFolderRequest): Promise<P.RenameFolderResponse> {
    return this.request<P.RenameFolderResponse>({
      endpoint: "/folder/rename",
      params: {
        id: opts.id,
        name: opts.name,
      },
      schema: P.RenameFolderResponse,
      method: "post",
    });
  }

  // PLACEHOLDER
  // pasteFolder() { }

  deleteFolder(opts: P.DeleteFolderRequest): Promise<P.DeleteFolderResponse> {
    return this.request<P.DeleteFolderResponse>({
      endpoint: "/folder/delete",
      params: {
        id: opts.id,
      },
      schema: P.DeleteFolderResponse,
      method: "post",
    });
  }

  searchFolder(opts: P.SearchFolderRequest): Promise<P.SearchFolderResponse> {
    return this.request<P.SearchFolderResponse>({
      endpoint: "/folder/search",
      params: {
        q: opts.query,
      },
      schema: P.SearchFolderResponse,
    });
  }

  listAllItems(): Promise<P.ListAllItemsResponse> {
    return this.request<P.ListAllItemsResponse>({
      endpoint: "/item/listall",
      params: {},
      schema: P.ListAllItemsResponse,
    });
  }

  deleteItem(opts: P.DeleteItemRequest): Promise<P.DeleteItemResponse> {
    return this.request<P.DeleteItemResponse>({
      endpoint: "/item/delete",
      params: {
        id: opts.id,
      },
      schema: P.DeleteItemResponse,
      method: "post",
    });
  }

  renameItem(opts: P.RenameItemRequest): Promise<P.RenameItemResponse> {
    return this.request<P.RenameItemResponse>({
      endpoint: "/item/rename",
      params: {
        id: opts.id,
        name: opts.name,
      },
      schema: P.RenameItemResponse,
      method: "post",
    });
  }

  getItemDetails(
    opts: P.GetItemDetailsRequest,
  ): Promise<P.GetItemDetailsResponse> {
    return this.request<P.GetItemDetailsResponse>({
      endpoint: "/item/details",
      params: {
        id: opts.id,
      },
      schema: P.GetItemDetailsResponse,
    });
  }

  createTransfer(
    opts: P.CreateTransferRequest,
  ): Promise<P.CreateTransferResponse> {
    return this.request<P.CreateTransferResponse>({
      endpoint: "/transfer/create",
      params: {
        src: opts.src,
        folder_id: opts.folder_id,
      },
      schema: P.CreateTransferResponse,
      method: "post",
    });
  }

  listTransfers(): Promise<P.ListTransfersResponse> {
    return this.request<P.ListTransfersResponse>({
      endpoint: "/transfer/list",
      params: {},
      schema: P.ListTransfersResponse,
    });
  }

  clearTransfers(): Promise<P.ClearTransfersResponse> {
    return this.request<P.ClearTransfersResponse>({
      endpoint: "/transfer/clearfinished",
      params: {},
      schema: P.ClearTransfersResponse,
      method: "post",
    });
  }

  deleteTransfers(
    opts: P.DeleteTransfersRequest,
  ): Promise<P.DeleteTransfersResponse> {
    return this.request<P.DeleteTransfersResponse>({
      endpoint: "/transfer/delete",
      params: {
        id: opts.id,
      },
      schema: P.DeleteTransfersResponse,
      method: "post",
    });
  }

  accountInfo(): Promise<P.AccountInfoResponse> {
    return this.request<P.AccountInfoResponse>({
      endpoint: "/account/info",
      params: {},
      schema: P.AccountInfoResponse,
    });
  }

  generateZip(opts: P.GenerateZipRequest): Promise<P.GenerateZipResponse> {
    return this.request<P.GenerateZipResponse>({
      endpoint: "/zip/generate",
      params: {
        files: opts.files,
        folders: opts.folders,
      },
      schema: P.GenerateZipResponse,
      method: "post",
    });
  }

  checkCache(opts: P.CheckCacheRequest): Promise<P.CheckCacheResponse> {
    return this.request<P.CheckCacheResponse>({
      endpoint: "/cache/check",
      params: {
        items: opts.items,
      },
      schema: P.CheckCacheResponse,
      method: "post",
    });
  }

  listServices(): Promise<P.ListServicesResponse> {
    return this.request<P.ListServicesResponse>({
      endpoint: "/services/list",
      params: {},
      schema: P.ListServicesResponse,
      method: "post",
    });
  }
}

export { PremiumizeError } from "./errors";
export default PremiumizeClient;
