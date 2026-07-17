"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useFavoriteBillers } from "@/lib/api/hooks/use-bills";
import { cn } from "@/lib/utils";
import {
  HeartIcon,
  ZapIcon,
  DropletIcon,
  WifiIcon,
  SmartphoneIcon,
  BuildingIcon,
} from "lucide-react";

interface BillFavorite {
  id: string;
  billerId: string;
  billerName: string;
  category: string;
  lastUsed?: string;
}

interface BillFavoritesListProps {
  onSelect?: (billerId: string) => void;
  className?: string;
}

const MAX_FAVORITES = 10;

const categoryConfig: Record<
  string,
  { icon: React.ElementType; color: string }
> = {
  SERVICIOS: { icon: ZapIcon, color: "text-yellow-500" },
  ENERGIA: { icon: ZapIcon, color: "text-yellow-500" },
  AGUA: { icon: DropletIcon, color: "text-blue-500" },
  INTERNET: { icon: WifiIcon, color: "text-violet-500" },
  TELEFONIA: { icon: SmartphoneIcon, color: "text-emerald-500" },
  GAS: { icon: ZapIcon, color: "text-orange-500" },
  default: { icon: BuildingIcon, color: "text-muted-foreground" },
};

function getCategoryConfig(category: string) {
  const key = category.toUpperCase();
  return categoryConfig[key] || categoryConfig.default;
}

export function BillFavoritesList({
  onSelect,
  className,
}: BillFavoritesListProps) {
  const { data, isLoading } = useFavoriteBillers();

  if (isLoading) {
    return <BillFavoritesListSkeleton className={className} />;
  }

  const favorites = data?.favorites || [];

  if (favorites.length === 0) {
    return (
      <Card className={className}>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <HeartIcon className="h-12 w-12 text-muted-foreground mb-4" />
          <p className="text-muted-foreground">No hay favoritos</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Favoritos</CardTitle>
      </CardHeader>
      <CardContent>
        {favorites.length >= MAX_FAVORITES && (
          <p className="text-sm text-muted-foreground mb-4">
            Máximo 10 favoritos alcanzado
          </p>
        )}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
          {favorites.map((favorite) => (
            <FavoriteCard
              key={favorite.id}
              favorite={favorite}
              onSelect={onSelect}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function FavoriteCard({
  favorite,
  onSelect,
}: {
  favorite: BillFavorite;
  onSelect?: (billerId: string) => void;
}) {
  const config = getCategoryConfig(favorite.category);
  const CategoryIcon = config.icon;

  return (
    <button
      onClick={() => onSelect?.(favorite.billerId)}
      className={cn(
        "flex flex-col items-center gap-2 rounded-lg border p-4",
        "transition-colors hover:bg-muted/50 cursor-pointer text-left"
      )}
    >
      <div
        className={cn(
          "flex h-10 w-10 items-center justify-center rounded-full bg-muted"
        )}
      >
        <CategoryIcon className={cn("h-5 w-5", config.color)} />
      </div>
      <p className="font-medium text-sm truncate w-full text-center">
        {favorite.billerName}
      </p>
      <p className="text-xs text-muted-foreground truncate w-full text-center">
        {favorite.category}
      </p>
    </button>
  );
}

function BillFavoritesListSkeleton({ className }: { className?: string }) {
  return (
    <Card className={className}>
      <CardHeader>
        <Skeleton className="h-5 w-32" />
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div
              key={i}
              className="flex flex-col items-center gap-2 rounded-lg border p-4"
            >
              <Skeleton className="h-10 w-10 rounded-full" />
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-3 w-16" />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
