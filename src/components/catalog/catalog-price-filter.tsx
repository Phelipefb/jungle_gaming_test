import { useState, type FormEvent } from "react";
import { useNavigate, useSearch } from "@tanstack/react-router";

import { Button } from "@/components/ui/button";

const MIN_PRICE = 0.02;
const MAX_PRICE = 12.3;
const PRICE_STEP = 0.01;

type PriceFilterFormProps = {
  initialMin: number;
  initialMax: number;
};

function formatPrice(value: number) {
  return value.toFixed(2).replace(".", ",");
}

function PriceFilterForm({ initialMin, initialMax }: PriceFilterFormProps) {
  const navigate = useNavigate({ from: "/" });
  const search = useSearch({ from: "/" });
  const [minPrice, setMinPrice] = useState(initialMin);
  const [maxPrice, setMaxPrice] = useState(initialMax);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    void navigate({
      to: "/",
      search: {
        ...search,
        minPrice: minPrice.toFixed(2),
        maxPrice: maxPrice.toFixed(2),
        page: 1,
      },
    });
  }

  return (
    <form onSubmit={handleSubmit} className="mt-2 px-3">
      <div className="relative h-5">
        <div
          aria-hidden="true"
          className="absolute top-1/2 h-1 w-full -translate-y-1/2 rounded-full bg-primary"
        />

        <input
          type="range"
          min={MIN_PRICE}
          max={MAX_PRICE}
          step={PRICE_STEP}
          value={minPrice}
          aria-label="Preço mínimo"
          onChange={(event) =>
            setMinPrice(Math.min(Number(event.target.value), maxPrice))
          }
          className="price-range-input"
        />

        <input
          type="range"
          min={MIN_PRICE}
          max={MAX_PRICE}
          step={PRICE_STEP}
          value={maxPrice}
          aria-label="Preço máximo"
          onChange={(event) =>
            setMaxPrice(Math.max(Number(event.target.value), minPrice))
          }
          className="price-range-input"
        />
      </div>

      <p className="mt-2 text-base leading-[21px] text-foreground">
        Preço: {formatPrice(minPrice)} - {formatPrice(maxPrice)} ETH
      </p>

      <Button
        type="submit"
        className="mt-3 h-9 w-[91px] rounded-md text-base font-bold"
      >
        Aplicar
      </Button>
    </form>
  );
}

export function CatalogPriceFilter() {
  const search = useSearch({ from: "/" });

  const initialMin = Math.max(
    MIN_PRICE,
    Math.min(MAX_PRICE, Number(search.minPrice ?? MIN_PRICE)),
  );

  const initialMax = Math.max(
    initialMin,
    Math.min(MAX_PRICE, Number(search.maxPrice ?? MAX_PRICE)),
  );

  return (
    <section className="mt-9">
      <h3 className="text-[18px] leading-6 font-bold">Faixa de preço</h3>

      <PriceFilterForm
        key={`${initialMin}-${initialMax}`}
        initialMin={initialMin}
        initialMax={initialMax}
      />
    </section>
  );
}
