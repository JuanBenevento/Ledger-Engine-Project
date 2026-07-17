"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { useRecipientSearch } from "@/lib/api/hooks/use-transfers";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Loader2Icon } from "lucide-react";

interface Recipient {
  userId: string;
  name: string;
  email: string;
  avatar: string | null;
}

interface RecipientSearchProps {
  onSelect: (recipient: Recipient) => void;
}

/**
 * RecipientSearch molecule.
 *
 * Email/phone input with debounce (300ms).
 * On input, searches for recipient.
 * Shows resolved user with avatar/name.
 * "No se encontró usuario" error state.
 * Loading spinner during search.
 */
export function RecipientSearch({ onSelect }: RecipientSearchProps) {
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [hasSearched, setHasSearched] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const { data: recipient, isLoading } = useRecipientSearch(debouncedQuery);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);

    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    timerRef.current = setTimeout(() => {
      setDebouncedQuery(value);
      if (value.length >= 3) {
        setHasSearched(true);
      }
    }, 300);
  }, []);

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);

  const handleSelectUser = (user: Recipient) => {
    onSelect(user);
  };

  return (
    <div className="space-y-2">
      <Label htmlFor="recipient-search">Correo o teléfono del destinatario</Label>
      <Input
        id="recipient-search"
        type="text"
        placeholder="Ej: carlos@correo.com o +57 300 123 4567"
        value={query}
        onChange={handleChange}
      />

      {isLoading && (
        <div className="flex items-center gap-2 text-muted-foreground">
          <Loader2Icon className="h-4 w-4 animate-spin" />
          <span>Buscando usuario...</span>
        </div>
      )}

      {!isLoading && recipient && (
        <button
          type="button"
          onClick={() => handleSelectUser(recipient)}
          className="flex items-center gap-3 w-full rounded-lg border p-3 hover:bg-muted/50 transition-colors text-left"
        >
          <Avatar>
            <AvatarFallback>
              {recipient.name.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="font-medium">{recipient.name}</p>
            <p className="text-sm text-muted-foreground">{recipient.email}</p>
          </div>
        </button>
      )}

      {!isLoading && hasSearched && debouncedQuery.length >= 3 && recipient === null && (
        <p className="text-sm text-destructive">No se encontró usuario</p>
      )}
    </div>
  );
}
