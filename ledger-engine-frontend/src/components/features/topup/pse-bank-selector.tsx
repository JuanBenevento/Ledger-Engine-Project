"use client";

import { useState, useMemo } from "react";
import { SearchIcon, BuildingIcon, CheckIcon, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface PSEBank {
  id: string;
  name: string;
}

const COLOMBIAN_BANKS: PSEBank[] = [
  { id: "bancolombia", name: "Bancolombia" },
  { id: "davivienda", name: "Davivienda" },
  { id: "bbva", name: "BBVA" },
  { id: "banco-de-bogota", name: "Banco de Bogotá" },
  { id: "banco-popular", name: "Banco Popular" },
  { id: "banco-av-villas", name: "Banco AV Villas" },
  { id: "banco-colkuda", name: "Banco Colkuda" },
  { id: "banco-de-occidente", name: "Banco de Occidente" },
  { id: "daviplata", name: "Daviplata" },
  { id: "nequi", name: "Nequi" },
];

interface PSEBankSelectorProps {
  onSelect: (bank: PSEBank) => void;
  disabled: boolean;
  selectedBankId?: string;
}

/**
 * PSEBankSelector molecule.
 *
 * Searchable bank list for PSE payments.
 * Displays Colombian banks with search filtering.
 * Bank selection triggers redirect to bank page (simulated).
 */
export function PSEBankSelector({
  onSelect,
  disabled,
  selectedBankId,
}: PSEBankSelectorProps) {
  const [search, setSearch] = useState("");

  const filteredBanks = useMemo(() => {
    if (!search.trim()) return COLOMBIAN_BANKS;
    const query = search.toLowerCase();
    return COLOMBIAN_BANKS.filter((bank) =>
      bank.name.toLowerCase().includes(query)
    );
  }, [search]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Selecciona tu banco</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="relative">
          <SearchIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar banco..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            disabled={disabled}
            className="pl-9"
          />
        </div>

        {filteredBanks.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">
            No se encontraron bancos
          </p>
        ) : (
          <div className="space-y-1" role="listbox" aria-label="Lista de bancos">
            {filteredBanks.map((bank) => (
              <button
                key={bank.id}
                type="button"
                role="option"
                aria-selected={selectedBankId === bank.id}
                onClick={() => onSelect(bank)}
                disabled={disabled}
                className="flex w-full items-center gap-3 rounded-lg border p-3 text-left transition-colors hover:bg-muted disabled:opacity-50"
              >
                <BuildingIcon className="h-5 w-5 text-muted-foreground shrink-0" />
                <span className="flex-1 text-sm font-medium">{bank.name}</span>
                {selectedBankId === bank.id && (
                  <CheckIcon className="h-4 w-4 text-primary" />
                )}
              </button>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
