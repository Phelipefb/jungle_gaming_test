import { useEffect } from "react";

import { nftSchema, type Nft, type NftUpdatedPayload } from "@/contracts";
import { queryClient } from "@/app/query-client";
import { getRealtimeClient } from "@/lib/realtime-client";
import { nftQueryKeys } from "@/queries/nfts";

export function RealtimeQuerySync() {
  useEffect(() => {
    let active = true;

    const handleNftUpdated = (payload: NftUpdatedPayload) => {
      queryClient.setQueryData<Nft>(
        nftQueryKeys.detail(payload.nftId),
        (currentNft) => {
          if (!currentNft) {
            return currentNft;
          }

          return nftSchema.parse({
            ...currentNft,
            price: payload.price,
            editions: payload.editions,
            version: payload.version,
          });
        },
      );

      void queryClient.invalidateQueries({
        queryKey: nftQueryKeys.lists(),
      });
    };

    let removeListener: (() => void) | undefined;

    void getRealtimeClient().then((socket) => {
      if (!active) {
        return;
      }

      socket.on("nft.updated", handleNftUpdated);

      removeListener = () => {
        socket.off("nft.updated", handleNftUpdated);
      };

      if (!socket.connected) {
        socket.connect();
      }
    });

    return () => {
      active = false;
      removeListener?.();
    };
  }, []);

  return null;
}
