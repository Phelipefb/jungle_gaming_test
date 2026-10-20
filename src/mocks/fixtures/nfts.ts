import { nftSchema } from "@/contracts";

const kurioApes = {
  id: "kurio-apes",
  name: "Kurio Apes",
};

const ethereum = {
  id: "ethereum",
  name: "Ethereum",
};

const polygon = {
  id: "polygon",
  name: "Polygon",
};

const solana = {
  id: "solana",
  name: "Solana",
};

const novaSato = {
  id: "nova-sato",
  name: "Nova Sato",
  avatarUrl: "/assets/nfts/emerald-ape-042.png",
  verified: true,
};

type CatalogNftFixtureInput = {
  id: string;
  name: string;
  imageUrl: string;
  price: string;
  previousPrice?: string;
  featured?: boolean;
  category?: string;
  network?: typeof ethereum;
};

function createCatalogNftFixture({
  id,
  name,
  imageUrl,
  price,
  previousPrice,
  featured = false,
  category = "Arte digital",
  network = ethereum,
}: CatalogNftFixtureInput) {
  return {
    id,
    name,
    description: "",
    imageUrl,
    gallery: [
      {
        id: `${id}-gallery-1`,
        url: imageUrl,
        alt: `${name} — visualização principal`,
      },
    ],
    category,
    collection: kurioApes,
    network,
    creator: novaSato,
    price: {
      amount: price,
      currency: "ETH",
    },
    previousPrice: previousPrice
      ? {
          amount: previousPrice,
          currency: "ETH",
        }
      : null,
    editions: [
      {
        id: `${id}-open`,
        name: "ABERTA",
        type: "OPEN",
        available: null,
        total: null,
        maxPerOrder: 10,
      },
    ],
    attributes: [],
    featured,
    version: 1,
  };
}

const paginationTemplates = [
  {
    slug: "emerald-ape",
    name: "Emerald Ape",
    imageUrl: "/assets/nfts/emerald-ape-042.png",
  },
  {
    slug: "sage-nomad",
    name: "Sage Nomad",
    imageUrl: "/assets/nfts/sage-nomad-009.png",
  },
  {
    slug: "neon-vessel",
    name: "Neon Vessel",
    imageUrl: "/assets/nfts/neon-vessel-552.png",
  },
  {
    slug: "cosmic-bloom",
    name: "Cosmic Bloom",
    imageUrl: "/assets/nfts/cosmic-bloom-118.png",
  },
  {
    slug: "violet-nomad",
    name: "Violet Nomad",
    imageUrl: "/assets/nfts/violet-nomad-314.png",
  },
  {
    slug: "ivory-baron",
    name: "Ivory Baron",
    imageUrl: "/assets/nfts/ivory-baron-088.png",
  },
  {
    slug: "golden-beat",
    name: "Golden Beat",
    imageUrl: "/assets/nfts/golden-beat-207.png",
  },
  {
    slug: "golden-signal",
    name: "Golden Signal",
    imageUrl: "/assets/nfts/golden-signal-160.png",
  },
] as const;

const paginationCategories = [
  "Arte digital",
  "Fotografia",
  "Música",
  "Arte 3D",
  "Utilidade",
] as const;

const paginationNetworks = [ethereum, polygon, solana] as const;

const paginationPrices = [
  "0.49",
  "0.79",
  "0.89",
  "1.09",
  "1.49",
  "1.89",
  "2.49",
  "3.19",
] as const;

const paginationNftFixtures = Array.from({ length: 24 }, (_, index) => {
  const template = paginationTemplates[index % paginationTemplates.length];
  const sequence = 101 + index;

  return createCatalogNftFixture({
    id: `${template.slug}-${sequence}`,
    name: `${template.name} #${sequence}`,
    imageUrl: template.imageUrl,
    price: paginationPrices[index % paginationPrices.length],
    category: paginationCategories[index % paginationCategories.length],
    network: paginationNetworks[index % paginationNetworks.length],
  });
});

export const nftFixtures = nftSchema.array().parse([
  {
    id: "emerald-ape-042",
    name: "Emerald Ape #042",
    description:
      "Um colecionável digital finalizado à mão da coleção Kurio Editions, verificado na Ethereum, com arte desbloqueável e acesso para colecionadores.",
    imageUrl: "/assets/nfts/emerald-ape-042.png",
    gallery: [
      {
        id: "emerald-gallery-1",
        url: "/assets/nfts/emerald-gallery-1.png",
        alt: "Emerald Ape #042 — visualização principal",
      },
      {
        id: "emerald-gallery-2",
        url: "/assets/nfts/emerald-gallery-2.png",
        alt: "Emerald Ape #042 — visualização 2",
      },
      {
        id: "emerald-gallery-3",
        url: "/assets/nfts/emerald-gallery-3.png",
        alt: "Emerald Ape #042 — visualização 3",
      },
      {
        id: "emerald-gallery-4",
        url: "/assets/nfts/emerald-gallery-4.png",
        alt: "Emerald Ape #042 — visualização 4",
      },
      {
        id: "emerald-gallery-5",
        url: "/assets/nfts/emerald-gallery-5.png",
        alt: "Emerald Ape #042 — visualização 5",
      },
    ],
    category: "Arte digital",
    collection: kurioApes,
    network: ethereum,
    creator: novaSato,
    price: {
      amount: "1.19",
      currency: "ETH",
    },
    previousPrice: null,
    editions: [
      {
        id: "emerald-1-of-1",
        name: "1/1",
        type: "LIMITED",
        available: 1,
        total: 1,
        maxPerOrder: 1,
      },
      {
        id: "emerald-1-of-10",
        name: "1/10",
        type: "LIMITED",
        available: 7,
        total: 10,
        maxPerOrder: 2,
      },
      {
        id: "emerald-1-of-50",
        name: "1/50",
        type: "LIMITED",
        available: 33,
        total: 50,
        maxPerOrder: 5,
      },
      {
        id: "emerald-open",
        name: "ABERTA",
        type: "OPEN",
        available: null,
        total: null,
        maxPerOrder: 10,
      },
    ],
    attributes: [
      {
        traitType: "Atributo",
        value: "Óculos",
      },
      {
        traitType: "Atributo",
        value: "Esmeralda",
      },
      {
        traitType: "Atributo",
        value: "Raro",
      },
    ],
    featured: true,
    version: 1,
  },

  createCatalogNftFixture({
    id: "sage-nomad-009",
    name: "Sage Nomad #009",
    imageUrl: "/assets/nfts/sage-nomad-009.png",
    price: "1.69",
    featured: true,
  }),
  createCatalogNftFixture({
    id: "neon-vessel-552",
    name: "Neon Vessel #552",
    imageUrl: "/assets/nfts/neon-vessel-552.png",
    price: "1.99",
    previousPrice: "2.29",
  }),
  createCatalogNftFixture({
    id: "cosmic-bloom-118",
    name: "Cosmic Bloom #118",
    imageUrl: "/assets/nfts/cosmic-bloom-118.png",
    price: "1.29",
  }),
  createCatalogNftFixture({
    id: "violet-nomad-314",
    name: "Violet Nomad #314",
    imageUrl: "/assets/nfts/violet-nomad-314.png",
    price: "1.39",
  }),
  createCatalogNftFixture({
    id: "ivory-baron-088",
    name: "Ivory Baron #088",
    imageUrl: "/assets/nfts/ivory-baron-088.png",
    price: "1.79",
  }),
  createCatalogNftFixture({
    id: "golden-beat-207",
    name: "Golden Beat #207",
    imageUrl: "/assets/nfts/golden-beat-207.png",
    price: "0.99",
  }),
  createCatalogNftFixture({
    id: "golden-signal-160",
    name: "Golden Signal #160",
    imageUrl: "/assets/nfts/golden-signal-160.png",
    price: "0.39",
  }),

  ...paginationNftFixtures,
]);
