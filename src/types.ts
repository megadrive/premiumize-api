// Types for Premiumize.me API

import { z } from "zod";

// Configuration interface (not derived from API)
export interface PremiumizeConfig {
  apiKey: string;
  baseUrl?: string;
}

// Zod Schemas (single source of truth)
export const AccountInfoSchema = z.object({
  customer_id: z.string(),
  premium_until: z.number(),
  limit_used: z.number(),
  limit_total: z.number(),
  space_used: z.number(),
  space_total: z.number(),
});

export const TransferSchema = z.object({
  id: z.string(),
  name: z.string(),
  message: z.string(),
  status: z.enum(["running", "finished", "error"]),
  progress: z.number(),
  eta: z.number(),
  folder_id: z.string(),
  file_id: z.string(),
});

export const CreateTransferRequestSchema = z.object({
  src: z.string(),
  folder_id: z.string().optional(),
});

export const CreateTransferResponseSchema = z.object({
  id: z.string(),
  name: z.string(),
  status: z.string(),
});

export const ListTransfersResponseSchema = z.object({
  transfers: z.array(TransferSchema),
});

export const FolderSchema = z.object({
  id: z.string(),
  name: z.string(),
  parent_id: z.string(),
  type: z.literal("folder"),
});

export const FileSchema = z.object({
  id: z.string(),
  name: z.string(),
  size: z.number(),
  created_at: z.number(),
  type: z.literal("file"),
  mime_type: z.string(),
  link: z.string(),
});

export const ItemSchema = z.union([FolderSchema, FileSchema]);

export const ListFolderResponseSchema = z.object({
  content: z.array(ItemSchema),
  name: z.string(),
  parent_id: z.string(),
});

export const ListAllItemSchema = z.object({
  files: z.array(ItemSchema),
});

export const ListAllItemsResponseSchema = z.object({
  status: z.enum(["success", "error"]),
  files: z.array(ItemSchema),
});

// Folder operations
export const RenameFolderRequestSchema = z.object({
  id: z.string(),
  name: z.string(),
});

export const PasteFolderRequestSchema = z.object({
  id: z.string(), // destination folder id
  items: z.array(z.string()), // array of item ids to paste
});

export const UploadInfoResponseSchema = z.object({
  url: z.string(),
  token: z.string(),
});

export const SearchFolderRequestSchema = z.object({
  q: z.string(), // search query
  folder_id: z.string().optional(), // folder to search in
});

export const SearchResultSchema = z.object({
  id: z.string(),
  name: z.string(),
  type: z.enum(["folder", "file"]),
  parent_id: z.string(),
  size: z.number().optional(), // only for files
});

export const SearchFolderResponseSchema = z.object({
  content: z.array(SearchResultSchema),
});

// Item operations
export const DeleteItemRequestSchema = z.object({
  id: z.string(),
});

export const RenameItemRequestSchema = z.object({
  id: z.string(),
  name: z.string(),
});

export const ItemDetailsResponseSchema = z.object({
  id: z.string(),
  name: z.string(),
  size: z.number(),
  created_at: z.number(),
  type: z.string(),
  mime_type: z.string(),
  link: z.string(),
  virus_scan: z.string().optional(),
  thumbnail: z.string().optional(),
});

// Transfer operations
export const DirectDownloadRequestSchema = z.object({
  src: z.string(), // magnet or torrent URL
  folder_id: z.string().optional(),
});

export const DirectDownloadResponseSchema = z.object({
  location: z.string(), // direct download URL
});

// Zip operations
export const GenerateZipRequestSchema = z.object({
  items: z.array(z.string()), // array of item ids
  name: z.string().optional(), // zip filename
});

export const GenerateZipResponseSchema = z.object({
  location: z.string(), // zip download URL
});

// Cache operations
export const CheckCacheRequestSchema = z.object({
  items: z.array(z.string()), // array of URLs to check
});

export const CacheCheckResultSchema = z.object({
  url: z.string(),
  status: z.enum(["success", "error"]),
  filename: z.string().optional(),
  filesize: z.number().optional(),
  link: z.string().optional(),
});

export const CheckCacheResponseSchema = z.object({
  response: z.array(CacheCheckResultSchema),
});

// Services operations
export const ServiceInfoSchema = z.object({
  name: z.string(),
  domains: z.array(z.string()),
  status: z.string(),
});

export const ListServicesResponseSchema = z.object({
  services: z.array(ServiceInfoSchema),
});

// ApiResponse schema
export const ApiResponseSchema = <T extends z.ZodTypeAny>(dataSchema: T) =>
  z.object({
    status: z.enum(["success", "error"]),
    message: z.string().optional(),
    data: dataSchema.optional(),
  });

// Specific API response schemas
export const DeleteTransferResponseSchema = ApiResponseSchema(z.null());
export const CreateFolderResponseSchema = ApiResponseSchema(
  z.object({ id: z.string() }),
);
export const DeleteFolderResponseSchema = ApiResponseSchema(z.null());
export const RenameFolderResponseSchema = ApiResponseSchema(z.null());
export const PasteFolderResponseSchema = ApiResponseSchema(z.null());
export const DeleteItemResponseSchema = ApiResponseSchema(z.null());
export const RenameItemResponseSchema = ApiResponseSchema(z.null());
export const ClearFinishedTransfersResponseSchema = ApiResponseSchema(z.null());

// Type inferences for schemas
export type ListAllItemsResponse = z.infer<typeof ListAllItemsResponseSchema>;
export type RenameFolderRequest = z.infer<typeof RenameFolderRequestSchema>;
export type PasteFolderRequest = z.infer<typeof PasteFolderRequestSchema>;
export type UploadInfoResponse = z.infer<typeof UploadInfoResponseSchema>;
export type SearchFolderRequest = z.infer<typeof SearchFolderRequestSchema>;
export type SearchResult = z.infer<typeof SearchResultSchema>;
export type SearchFolderResponse = z.infer<typeof SearchFolderResponseSchema>;
export type DeleteItemRequest = z.infer<typeof DeleteItemRequestSchema>;
export type RenameItemRequest = z.infer<typeof RenameItemRequestSchema>;
export type ItemDetailsResponse = z.infer<typeof ItemDetailsResponseSchema>;
export type DirectDownloadRequest = z.infer<typeof DirectDownloadRequestSchema>;
export type DirectDownloadResponse = z.infer<
  typeof DirectDownloadResponseSchema
>;
export type GenerateZipRequest = z.infer<typeof GenerateZipRequestSchema>;
export type GenerateZipResponse = z.infer<typeof GenerateZipResponseSchema>;
export type CheckCacheRequest = z.infer<typeof CheckCacheRequestSchema>;
export type CacheCheckResult = z.infer<typeof CacheCheckResultSchema>;
export type CheckCacheResponse = z.infer<typeof CheckCacheResponseSchema>;
export type ServiceInfo = z.infer<typeof ServiceInfoSchema>;
export type ListServicesResponse = z.infer<typeof ListServicesResponseSchema>;

// Derived type inferences
export type ApiResponse<T> = {
  status: "success" | "error";
  message?: string;
  data?: T;
};

// Type inferences for schemas (derived types)
export type AccountInfo = z.infer<typeof AccountInfoSchema>;
export type Transfer = z.infer<typeof TransferSchema>;
export type CreateTransferRequest = z.infer<typeof CreateTransferRequestSchema>;
export type CreateTransferResponse = z.infer<
  typeof CreateTransferResponseSchema
>;
export type ListTransfersResponse = z.infer<typeof ListTransfersResponseSchema>;
export type Folder = z.infer<typeof FolderSchema>;
export type File = z.infer<typeof FileSchema>;
export type Item = z.infer<typeof ItemSchema>;
export type ListFolderResponse = z.infer<typeof ListFolderResponseSchema>;
