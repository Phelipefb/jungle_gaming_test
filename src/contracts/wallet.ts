import { z } from "zod";

import { priceSchema } from "@/contracts/nft";

export const walletNetworkSchema = z.literal("ETHEREUM");

export const walletStatusSchema = z.enum(["CONNECTED", "DISCONNECTED"]);

export const walletSchema = z.object({
  id: z.string().min(1),
  providerName: z.string().min(1),
  address: z.string().min(1),
  network: walletNetworkSchema,
  balance: priceSchema,
  status: walletStatusSchema,
  connectedAt: z.string().datetime({ offset: true }),
  primary: z.boolean(),
});

export const walletListResponseSchema = z.object({
  items: z.array(walletSchema),
});

export const connectWalletRequestSchema = z.object({
  providerId: z.string().min(1),
});

export const connectWalletResponseSchema = z.object({
  wallet: walletSchema,
});

export type WalletNetwork = z.infer<typeof walletNetworkSchema>;
export type WalletStatus = z.infer<typeof walletStatusSchema>;
export type Wallet = z.infer<typeof walletSchema>;
export type WalletListResponse = z.infer<typeof walletListResponseSchema>;
export type ConnectWalletRequest = z.infer<typeof connectWalletRequestSchema>;
export type ConnectWalletResponse = z.infer<typeof connectWalletResponseSchema>;
