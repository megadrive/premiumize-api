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

// Type inference from schemas (derived types)
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
export type ApiResponse<T> = {
  status: "success" | "error";
  message?: string;
  data?: T;
};
