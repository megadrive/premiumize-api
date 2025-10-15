// Types for Premiumize.me API

import { z } from "zod";

export interface PremiumizeConfig {
  apiKey: string;
  baseUrl?: string;
}

export interface AccountInfo {
  customer_id: string;
  premium_until: number;
  limit_used: number;
  limit_total: number;
  space_used: number;
  space_total: number;
}

export interface Transfer {
  id: string;
  name: string;
  message: string;
  status: "running" | "finished" | "error";
  progress: number;
  eta: number;
  folder_id: string;
  file_id: string;
}

export interface CreateTransferRequest {
  src: string; // magnet or torrent URL
  folder_id?: string;
}

export interface CreateTransferResponse {
  id: string;
  name: string;
  status: string;
}

export interface ListTransfersResponse {
  transfers: Transfer[];
}

export interface Folder {
  id: string;
  name: string;
  parent_id: string;
  type: "folder";
}

export interface File {
  id: string;
  name: string;
  size: number;
  created_at: number;
  type: "file";
  mime_type: string;
  link: string;
}

export type Item = Folder | File;

export interface ListFolderResponse {
  content: Item[];
  name: string;
  parent_id: string;
}

export interface ApiResponse<T> {
  status: "success" | "error";
  message?: string;
  data?: T;
}

// Zod Schemas
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

export const ApiResponseSchema = <T extends z.ZodTypeAny>(dataSchema: T) =>
  z.object({
    status: z.enum(["success", "error"]),
    message: z.string().optional(),
    data: dataSchema.optional(),
  });

// Specific API response schemas
export const DeleteTransferResponseSchema = ApiResponseSchema(z.null());
export const CreateFolderResponseSchema = ApiResponseSchema(
  z.object({ id: z.string() })
);
export const DeleteFolderResponseSchema = ApiResponseSchema(z.null());

// Type inference from schemas
export type AccountInfoType = z.infer<typeof AccountInfoSchema>;
export type TransferType = z.infer<typeof TransferSchema>;
export type CreateTransferRequestType = z.infer<
  typeof CreateTransferRequestSchema
>;
export type CreateTransferResponseType = z.infer<
  typeof CreateTransferResponseSchema
>;
export type ListTransfersResponseType = z.infer<
  typeof ListTransfersResponseSchema
>;
export type FolderType = z.infer<typeof FolderSchema>;
export type FileType = z.infer<typeof FileSchema>;
export type ItemType = z.infer<typeof ItemSchema>;
export type ListFolderResponseType = z.infer<typeof ListFolderResponseSchema>;
