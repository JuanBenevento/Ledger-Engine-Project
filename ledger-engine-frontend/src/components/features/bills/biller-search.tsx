"use client";

import React, { useState } from "react";
import { useBillerSearch, type Biller } from "@/lib/api/hooks/use-bills";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2Icon, ZapIcon, DropletIcon, FlameIcon, WifiIcon, SearchIcon } from "lucide-react";

interface BillerSearchProps {
  onSelect: (biller: Biller) => void;
}

const CATEGORIES = [
  { id: "Energía", label: "Energía", icon: React.createElement(ZapIcon, { className: "h-4 w-4" }) },
  { id: "Agua", label: "Agua", icon: React.createElement(DropletIcon, { className: "h-4 w-4" }) },
  { id: "Gas", label: "Gas", icon: React.createElement(FlameIcon, { className: "h-4 w-4" }) },
  { id: "Telecom", label: "Telecom", icon: React.createElement(WifiIcon, { className: "h-4 w-4" }) },
];

const POPULARBILLERS: Biller[] = [
  { id: "biller-1", name: "EPM", category: "Energía", active: true },
  { id: "biller-2", name: "Codensa", category: "Energía", active: true },
  { id: "biller-3", name: "Vasa", category: "Agua", active: true },
  { id: "biller-4", name: "Etb", category: "Telecom", active: true },
  { id: "biller-5", name: "Gas Natural", category: "Gas", active: true },
];

export function BillerSearch({ onSelect }: BillerSearchProps) {
  const [query, setQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const { data: searchResults, isLoading } = useBillerSearch(query);

  const displayBillers = searchResults && searchResults.length > 0
    ? searchResults
    : query.length < 2
      ? POPULARBILLERS.filter((b) => !selectedCategory || b.category === selectedCategory)
      : [];

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="biller-search">Buscar facturador</Label>
        <div className="relative">
          <SearchIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            id="biller-search"
            type="text"
            placeholder="Ej: EPM, Codensa, Vasa..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      {/* Categories */}
      <div className="flex gap-2">
        {CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            type="button"
            onClick={() => setSelectedCategory(selectedCategory === cat.id ? null : cat.id)}
            className={`flex items-center gap-1 rounded-full px-3 py-1 text-sm transition-colors ${
              selectedCategory === cat.id
                ? "bg-primary text-primary-foreground"
                : "bg-muted hover:bg-muted/80"
            }`}
          >
            {cat.icon}
            {cat.label}
          </button>
        ))}
      </div>

      {/* Loading */}
      {isLoading && (
        <div className="flex items-center gap-2 text-muted-foreground">
          <Loader2Icon className="h-4 w-4 animate-spin" />
          <span>Buscando facturadores...</span>
        </div>
      )}

      {/* Popular billers label */}
      {!isLoading && query.length < 2 && (
        <p className="text-sm font-medium text-muted-foreground">Facturadores populares</p>
      )}

      {/* Biller list */}
      {!isLoading && displayBillers.length > 0 && (
        <div className="space-y-1">
          {displayBillers.map((biller) => (
            <button
              key={biller.id}
              type="button"
              onClick={() => onSelect(biller)}
              className="flex w-full items-center gap-3 rounded-lg border p-3 text-left transition-colors hover:bg-muted/50"
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted">
                {biller.category === "Energía" && React.createElement(ZapIcon, { className: "h-4 w-4" })}
                {biller.category === "Agua" && React.createElement(DropletIcon, { className: "h-4 w-4" })}
                {biller.category === "Gas" && React.createElement(FlameIcon, { className: "h-4 w-4" })}
                {biller.category === "Telecom" && React.createElement(WifiIcon, { className: "h-4 w-4" })}
              </div>
              <div>
                <p className="font-medium">{biller.name}</p>
                <p className="text-sm text-muted-foreground">{biller.category}</p>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* No results */}
      {!isLoading && query.length >= 2 && displayBillers.length === 0 && (
        <p className="text-sm text-muted-foreground">No se encontraron facturadores</p>
      )}
    </div>
  );
}
