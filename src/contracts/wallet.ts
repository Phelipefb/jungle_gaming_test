import { z } from "zod";

export const walletStatusSchema = z.enum(["CONNECTED", "DISCONNECTED"]);

export const walletProviderSchema = z.enum([
  "WALLET_CONNECT",
  "METAMASK",
  "COINBASE_WALLET",
]);

export const walletNetworkSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
});

export const walletSchema = z.object({
  id: z.string().min(1),
  displayName: z.string().min(1),
  profileName: z.string().min(1),
  email: z.string().email(),
  address: z.string().min(1),
  ensName: z.string().min(1).nullable(),
  referralCode: z.string().min(1).nullable(),
  provider: walletProviderSchema,
  network: walletNetworkSchema,
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
  displayName: z.string().min(2, "Informe o nome de exibição"),
  profileName: z.string().min(2, "Informe o nome do perfil"),
  email: z.string().email("Informe um e-mail válido"),
  address: z.string().min(1, "Informe o endereço da carteira"),
  ensName: z.string().min(1).nullable(),
  referralCode: z.string().min(1).nullable(),
  provider: walletProviderSchema,
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
export type WalletProvider = z.infer<typeof walletProviderSchema>;
export type WalletNetwork = z.infer<typeof walletNetworkSchema>;
export type Wallet = z.infer<typeof walletSchema>;
export type WalletListResponse = z.infer<typeof walletListResponseSchema>;
export type CreateWalletRequest = z.infer<typeof createWalletRequestSchema>;
export type UpdateWalletRequest = z.infer<typeof updateWalletRequestSchema>;
export type ConnectWalletRequest = z.infer<typeof connectWalletRequestSchema>;
export type ConnectWalletResponse = z.infer<typeof connectWalletResponseSchema>;
