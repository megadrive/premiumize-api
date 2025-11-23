// Types for Premiumize.me API

import { z } from "zod";

// Configuration interface (not derived from API)
export interface PremiumizeConfig {
  apiKey: string;
  baseUrl?: string;
  verboseLogging?: boolean;
  obfuscateApiKeysInLogs?: boolean;
}

export const APIResponseError = z.object({
  status: z.literal("error"),
  message: z
    .string()
    .nullish()
    .describe("Error message as returned by Premiumize."),
});

export const Item = z.object({
  id: z.string().describe("Item ID"),
  name: z.string().describe("Item name"),
  type: z.enum(["file", "folder"]).describe("Item type"),
  size: z.number().describe("Item size in bytes").nullish(),
  mime_type: z.string().nullish(),
  link: z.string().nullish(),
  directlink: z.string().nullish(),
  stream_link: z.string().nullish(),
  transcode_status: z
    .enum([
      "not_applicable",
      "running",
      "finished",
      "pending",
      "good_as_is",
      "error",
      "fetch_pending",
    ])
    .nullish(),
  virus_scan: z.enum(["ok", "infected", "error"]).nullish(),
  crc32: z.string().nullish(),
  unpackable: z.boolean().nullish(),
  created_at: z
    .number()
    .nullish()
    .describe("Item creation date as a UTC timestamp"),
});

export const ItemFolder = Item.pick({
  id: true,
  name: true,
}).merge(
  z.object({
    type: z.literal("folder"),
  }),
);

export const ItemFile = Item.pick({
  id: true,
  name: true,
  size: true,
  crc32: true,
  created_at: true,
  mime_type: true,
  link: true,
  directlink: true,
  stream_link: true,
  unpackable: true,
}).merge(
  z.object({
    type: z.literal("file"),
  }),
);

/**
 * FOLDER START
 */

export const ListFolderRequest = z.object({
  id: z
    .string()
    .optional()
    .describe("Folder ID to list, leave empty for the root."),
  includebreadcrumbs: z
    .boolean()
    .default(false)
    .describe("Include breadcrumbs from root to the item."),
});

export const ListFolderResponse = z.object({
  content: z.array(z.discriminatedUnion("type", [ItemFolder, ItemFile])),
  name: z.string().describe("Name of the folder"),
  parent_id: z.string().describe("Parent folder ID"),
  folder_id: z.string().describe("Folder ID"),
  breadcrumbs: z
    .array(
      z.object({
        id: z.string().describe("Breadcrumb ID"),
        name: z.string().describe("Breadcrumb name"),
      }),
    )
    .nullish(),
});

export const CreateFolderRequest = z.object({
  name: z.string().min(1).describe("Folder name"),
  parent_id: z.string().optional().describe("Parent folder ID"),
});

export const CreateFolderResponse = z.object({
  id: z.string().describe("Folder ID"),
});

export const RenameFolderRequest = z.object({
  id: z.string().describe("Folder ID"),
  name: z.string().min(1).describe("New folder name"),
});

export const RenameFolderResponse = z.object({ message: z.string().nullish() });

export const DeleteFolderRequest = z.object({
  id: z.string().describe("Folder ID"),
});

export const DeleteFolderResponse = z.object({ message: z.string().nullish() });

export const SearchFolderRequest = z.object({
  query: z.string().min(1).describe("Search query"),
});

export const SearchFolderResponse = z.object({
  content: z.array(z.discriminatedUnion("type", [ItemFolder, ItemFile])),
  name: z.string().default("Search Results"),
});

/**
 * FOLDER END
 */

/**
 * ITEM START
 */

export const ListAllItemsRequest = z.undefined(); // unneeded, here for completeness
export const ListAllItemsResponse = z.object({
  files: z.array(
    Item.pick({
      id: true,
      name: true,
      created_at: true,
      size: true,
      mime_type: true,
      virus_scan: true,
    }).merge(
      z.object({
        path: z.string(),
      }),
    ),
  ),
});

export const DeleteItemRequest = z.object({
  id: z.string().describe("Item ID"),
});

export const DeleteItemResponse = z.object({
  message: z.string().nullish(),
});

export const RenameItemRequest = z.object({
  id: z.string(),
  name: z.string(),
});

export const RenameItemResponse = z.object({
  message: z.string().nullish(),
});

export const GetItemDetailsRequest = z.object({
  id: z.string(),
});

export const GetItemDetailsResponse = Item.pick({
  id: true,
  name: true,
  size: true,
  created_at: true,
  link: true,
  mime_type: true,
  transcode_status: true,
  virus_scan: true,
  stream_link: true,
}).merge(
  z.object({
    type: z.literal("file"),
    folder_id: z.string(),
    server_name: z.string().nullish(),
    acodec: z.string().nullish(),
    vcodec: z.string().nullish(),
    opensubtitles_hash: z.string().nullish(),
    resx: z.coerce.number().nullish(),
    resy: z.coerce.number().nullish(),
    duration: z.coerce.number().nullish(),
    audio_track_names: z.array(z.string()).nullish(),
    bitrate: z.coerce.number().nullish(),
  }),
);

/**
 * ITEM END
 */

/**
 * TRANSFER START
 */

export const CreateTransferRequest = z.object({
  src: z.string(),
  // file
  folder_id: z.string().optional(),
});

export const CreateTransferResponse = z.object({
  id: z.string(),
  name: z.string(),
  type: z.string(),
});

export const ListTransfersRequest = z.undefined();

export const ListTransfersResponse = z.object({
  transfers: z.array(
    z.object({
      id: z.string(),
      name: z.string(),
      message: z.string().nullish(),
      status: z.enum([
        "waiting",
        "finished",
        "running",
        "deleted",
        "banned",
        "error",
        "timeout",
        "seeding",
        "queued",
      ]),
      progress: z.coerce.number(),
      src: z.string(),
      folder_id: z.string().nullish(),
      file_id: z.string().nullish(),
    }),
  ),
});

export const ClearTransfersRequest = z.undefined();

export const ClearTransfersResponse = z.object({
  message: z.string().nullish(),
});

export const DeleteTransfersRequest = z.object({
  id: z.string(),
});

export const DeleteTransfersResponse = z.object({
  message: z.string().nullish(),
});

/**
 * TRANSFER END
 */

/**
 * ACCOUNT START
 */
export const AccountInfoRequest = z.undefined();

export const AccountInfoResponse = z.object({
  customer_id: z.coerce.number(),
  premium_until: z.coerce.number(),
  limit_used: z.coerce.number(),
  space_used: z.coerce.number(),
});

/**
 * ACCOUNT END
 */

/**
 * ZIP START
 */

export const GenerateZipRequest = z.object({
  files: z.array(z.string()).nullish(),
  folders: z.array(z.string()).nullish(),
});

export const GenerateZipResponse = z.object({
  location: z.string(),
});

/**
 * ZIP END
 */

/**
 * CACHE START
 */

export const CheckCacheRequest = z.object({
  items: z.array(z.string()),
});

export const CheckCacheResponse = z.object({
  response: z.array(z.boolean()),
  transcoded: z.array(z.boolean()),
  filename: z.array(z.string()),
  filesize: z.array(z.coerce.number()),
});

/**
 * CACHE END
 */

/**
 * SERVICES START
 */

export const ListServicesRequest = z.undefined();
export const ListServicesResponse = z.object({
  directdl: z.array(z.string()),
  cache: z.array(z.string()),
  fairusefactor: z.record(z.string(), z.number()),
  aliases: z.record(z.string(), z.array(z.string())),
  regexpatterns: z.record(z.string(), z.array(z.string())),
});

/**
 * TYPES
 */
export type ListFolderRequest = z.infer<typeof ListFolderRequest>;
export type ListFolderResponse = z.infer<typeof ListFolderResponse>;
export type CreateFolderRequest = z.infer<typeof CreateFolderRequest>;
export type CreateFolderResponse = z.infer<typeof CreateFolderResponse>;
export type RenameFolderRequest = z.infer<typeof RenameFolderRequest>;
export type RenameFolderResponse = z.infer<typeof RenameFolderResponse>;
export type DeleteFolderRequest = z.infer<typeof DeleteFolderRequest>;
export type DeleteFolderResponse = z.infer<typeof DeleteFolderResponse>;
export type SearchFolderRequest = z.infer<typeof SearchFolderRequest>;
export type SearchFolderResponse = z.infer<typeof SearchFolderResponse>;

export type ListAllItemsRequest = z.infer<typeof ListAllItemsRequest>;
export type ListAllItemsResponse = z.infer<typeof ListAllItemsResponse>;
export type DeleteItemRequest = z.infer<typeof DeleteItemRequest>;
export type DeleteItemResponse = z.infer<typeof DeleteItemResponse>;
export type RenameItemRequest = z.infer<typeof RenameItemRequest>;
export type RenameItemResponse = z.infer<typeof RenameItemResponse>;
export type GetItemDetailsRequest = z.infer<typeof GetItemDetailsRequest>;
export type GetItemDetailsResponse = z.infer<typeof GetItemDetailsResponse>;

export type CreateTransferRequest = z.infer<typeof CreateTransferRequest>;
export type CreateTransferResponse = z.infer<typeof CreateTransferResponse>;
export type ListTransfersRequest = z.infer<typeof ListTransfersRequest>;
export type ListTransfersResponse = z.infer<typeof ListTransfersResponse>;
export type ClearTransfersRequest = z.infer<typeof ClearTransfersRequest>;
export type ClearTransfersResponse = z.infer<typeof ClearTransfersResponse>;
export type DeleteTransfersRequest = z.infer<typeof DeleteTransfersRequest>;
export type DeleteTransfersResponse = z.infer<typeof DeleteTransfersResponse>;

export type AccountInfoRequest = z.infer<typeof AccountInfoRequest>;
export type AccountInfoResponse = z.infer<typeof AccountInfoResponse>;

export type GenerateZipRequest = z.infer<typeof GenerateZipRequest>;
export type GenerateZipResponse = z.infer<typeof GenerateZipResponse>;

export type CheckCacheRequest = z.infer<typeof CheckCacheRequest>;
export type CheckCacheResponse = z.infer<typeof CheckCacheResponse>;

export type ListServicesRequest = z.infer<typeof ListServicesRequest>;
export type ListServicesResponse = z.infer<typeof ListServicesResponse>;

export type APIResponseError = z.infer<typeof APIResponseError>;
