import axios, { AxiosInstance, CreateAxiosDefaults } from "axios";
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
  private readonly apiKey: string;
  private get apiKeyObfuscated() {
    if (this.obfuscateApiKeysInLogs) {
      return obfuscateString(this.apiKey);
    }
    return this.apiKey;
  }
  private client: AxiosInstance;
  private config: P.PremiumizeConfig;
  /** Log when verboseLogging is enabled */
  private verboseLog = (...args: unknown[]) => {
    if (this.config.verboseLogging) {
      console.log(...args);
    }
  };
  /**
   * Verbose logging, enables the `verboseLog` function.
   */
  verboseLogging = false;
  obfuscateApiKeysInLogs = true;

  static create(
    apiKey: string,
    opts: Partial<Omit<P.PremiumizeConfig, "apiKey">> = {},
    axiosConfig: CreateAxiosDefaults = {},
  ): PremiumizeClient {
    const resolvedOpts = {
      baseUrl: "https://www.premiumize.me/api",
      ...opts,
    };
    return new PremiumizeClient({ apiKey, ...resolvedOpts }, axiosConfig);
  }

  constructor(config: P.PremiumizeConfig, axiosConfig?: CreateAxiosDefaults) {
    this.apiKey = config.apiKey;
    config.apiKey = "";
    this.config = Object.freeze({
      baseUrl: "https://www.premiumize.me/api",
      ...config,
    });

    this.client = axios.create({
      // default timeout, but can be overridden
      timeout: 10000,
      // apply provided config
      ...axiosConfig,
      // prefer provided baseUrl from config
      baseURL: this.config.baseUrl,
    });

    this.verboseLogging = this.config.verboseLogging ?? false;
    if (this.verboseLogging) {
      console.info(`Verbose logging enabled`);
    }
    this.obfuscateApiKeysInLogs = this.config.obfuscateApiKeysInLogs ?? true;
    if (!this.obfuscateApiKeysInLogs) {
      console.warn(`Not obfuscating API key in logs, be careful doing this in production.`);
    }
  }

  private async request<T>(opts: RequestArguments): Promise<T> {
    // Ensure APIKEY is not 0-length
    if (!this.apiKey) {
      throw new Error("API key is required");
    }

    // default to GET
    const method = opts.method ?? "get";

    this.verboseLog(`[${method.toUpperCase()}] ${opts.endpoint} with ${this.apiKeyObfuscated}`);

    try {
      let response = await (() => {
        if (method === "post") {
          return this.client.post(opts.endpoint, null, {
            params: {
              apikey: this.apiKey,
              ...opts.params,
            },
          });
        }

        return this.client.get(opts.endpoint, {
          params: {
            apikey: this.apiKey,
            ...opts.params,
          },
        });
      })();

      const { path, method: reqMethod } = response.request ?? {};
      this.verboseLog({
        req: {
          method: reqMethod,
          path: path.replace(new RegExp(this.apiKey), this.apiKeyObfuscated),
        },
      });

      // API-level error returned in the body
      if (response.data && response.data.status === "error") {
        throw new PremiumizeError(response.data.message || "API request failed", response.data);
      }

      // Validate response with Zod schema if provided
      if (opts.schema) {
        const validationResult = opts.schema.safeParse(response.data);
        if (!validationResult.success) {
          throw new Error(`API response validation failed: ${validationResult.error.message}`);
        }
        return validationResult.data as T;
      }

      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new PremiumizeError(`API request failed: ${error.message}`, error);
      }
      // Re-throw custom errors (PremiumizeError) or other unexpected errors
      throw error;
    }
  }

  listFolder(opts: P.ListFolderRequest = {}): Promise<P.ListFolderResponse> {
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

  pasteFolder(opts: P.PasteFolderRequest): Promise<P.PasteFolderResponse> {
    return this.request<P.PasteFolderResponse>({
      endpoint: "/folder/paste",
      params: {
        id: opts.id,
        folders: opts.folders,
        files: opts.files,
      },
      schema: P.PasteFolderResponse,
      method: "post",
    });
  }

  /** get upload info. you will receive a token and a url. make a html upload to the url and send the file as "file" parameter and the token as "token" parameter. the file will be stored to the folder specified. */
  getUploadInfo(opts: P.GetUploadInfoRequest): Promise<P.GetUploadInfoResponse> {
    return this.request<P.GetUploadInfoResponse>({
      endpoint: "/folder/uploadinfo",
      params: {
        id: opts.id,
      },
      schema: P.GetUploadInfoResponse,
    });
  }

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

  getItemDetails(opts: P.GetItemDetailsRequest): Promise<P.GetItemDetailsResponse> {
    return this.request<P.GetItemDetailsResponse>({
      endpoint: "/item/details",
      params: {
        id: opts.id,
      },
      schema: P.GetItemDetailsResponse,
    });
  }

  createTransfer(opts: P.CreateTransferRequest): Promise<P.CreateTransferResponse> {
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

  deleteTransfers(opts: P.DeleteTransfersRequest): Promise<P.DeleteTransfersResponse> {
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
        files: opts.files ?? [],
        folders: opts.folders ?? [],
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
    });
  }

  listServices(): Promise<P.ListServicesResponse> {
    return this.request<P.ListServicesResponse>({
      endpoint: "/services/list",
      params: {},
      schema: P.ListServicesResponse,
    });
  }
}

export { PremiumizeError } from "./errors";
export default PremiumizeClient;
