import { z } from "zod";

import { priceSchema } from "@/contracts/nft";

export const walletStatusSchema = z.enum(["CONNECTED", "DISCONNECTED"]);

export const walletNetworkSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  currency: z.literal("ETH"),
});

export const walletSchema = z.object({
  id: z.string().min(1),
  providerName: z.string().min(1),
  address: z.string().min(1),
  network: walletNetworkSchema,
  balance: priceSchema,
  status: walletStatusSchema,
  primary: z.boolean(),
  createdAt: z.string().datetime({ offset: true }),
  updatedAt: z.string().datetime({ offset: true }),
});

export const walletListResponseSchema = z.object({
  items: z.array(walletSchema),
  networks: z.array(walletNetworkSchema).min(1),
});

export const createWalletRequestSchema = z.object({
  providerName: z.string().min(1),
  address: z.string().min(1),
  networkId: z.string().min(1),
  primary: z.boolean(),
});

export const updateWalletRequestSchema = createWalletRequestSchema;

export const connectWalletRequestSchema = z.object({
  walletId: z.string().min(1),
  networkId: z.string().min(1),
});

export const connectWalletResponseSchema = z.object({
  wallet: walletSchema,
});

export type WalletStatus = z.infer<typeof walletStatusSchema>;
export type WalletNetwork = z.infer<typeof walletNetworkSchema>;
export type Wallet = z.infer<typeof walletSchema>;
export type WalletListResponse = z.infer<typeof walletListResponseSchema>;
export type CreateWalletRequest = z.infer<typeof createWalletRequestSchema>;
export type UpdateWalletRequest = z.infer<typeof updateWalletRequestSchema>;
export type ConnectWalletRequest = z.infer<typeof connectWalletRequestSchema>;
export type ConnectWalletResponse = z.infer<typeof connectWalletResponseSchema>;
