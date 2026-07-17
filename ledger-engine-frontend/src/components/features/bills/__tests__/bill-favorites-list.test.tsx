import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import React from "react";

// Mock useFavoriteBillers
vi.mock("@/lib/api/hooks/use-bills", () => ({
  useFavoriteBillers: vi.fn(),
}));

// Mock Badge
vi.mock("@/components/ui/badge", () => ({
  Badge: ({ children, variant }: { children: React.ReactNode; variant?: string }) =>
    React.createElement("span", { "data-testid": "badge", "data-variant": variant }, children),
}));

// Mock Card
vi.mock("@/components/ui/card", () => ({
  Card: ({ children, className }: any) => React.createElement("div", { "data-testid": "card", className }, children),
  CardContent: ({ children }: any) => React.createElement("div", { "data-testid": "card-content" }, children),
  CardHeader: ({ children }: any) => React.createElement("div", { "data-testid": "card-header" }, children),
  CardTitle: ({ children }: any) => React.createElement("h3", { "data-testid": "card-title" }, children),
}));

// Mock Skeleton — uses data-slot like the real component
vi.mock("@/components/ui/skeleton", () => ({
  Skeleton: ({ className, ...props }: any) =>
    React.createElement("div", { "data-slot": "skeleton", className, ...props }),
}));

// Mock cn
vi.mock("@/lib/utils", () => ({
  cn: (...classes: any[]) => classes.filter(Boolean).join(" "),
}));

// Mock lucide-react icons
vi.mock("lucide-react", () => ({
  HeartIcon: (props: any) => React.createElement("svg", { "data-testid": "heart-icon", ...props }),
  PlusIcon: (props: any) => React.createElement("svg", { "data-testid": "plus-icon", ...props }),
  Trash2Icon: (props: any) => React.createElement("svg", { "data-testid": "trash-icon", ...props }),
  ZapIcon: (props: any) => React.createElement("svg", { "data-testid": "zap-icon", ...props }),
  DropletIcon: (props: any) => React.createElement("svg", { "data-testid": "droplet-icon", ...props }),
  WifiIcon: (props: any) => React.createElement("svg", { "data-testid": "wifi-icon", ...props }),
  SmartphoneIcon: (props: any) => React.createElement("svg", { "data-testid": "smartphone-icon", ...props }),
  BuildingIcon: (props: any) => React.createElement("svg", { "data-testid": "building-icon", ...props }),
}));

import { BillFavoritesList } from "../bill-favorites-list";
import { useFavoriteBillers } from "@/lib/api/hooks/use-bills";

function createFavorite(overrides: Partial<Record<string, any>> = {}) {
  return {
    id: "fav-1",
    billerId: "biller-1",
    billerName: "EPM",
    category: "SERVICIOS",
    lastUsed: "2026-03-15T10:00:00Z",
    ...overrides,
  };
}

describe("BillFavoritesList", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("shows empty state when no favorites", () => {
    vi.mocked(useFavoriteBillers).mockReturnValue({
      data: { favorites: [] },
      isLoading: false,
      error: null,
    } as any);

    render(React.createElement(BillFavoritesList));

    expect(screen.getByText("No hay favoritos")).toBeInTheDocument();
    expect(screen.getByTestId("card")).toBeInTheDocument();
  });

  it("shows skeleton when isLoading", () => {
    vi.mocked(useFavoriteBillers).mockReturnValue({
      data: null,
      isLoading: true,
      error: null,
    } as any);

    render(React.createElement(BillFavoritesList));

    const skeletons = document.querySelectorAll('[data-slot="skeleton"]');
    expect(skeletons.length).toBeGreaterThan(0);
  });

  it("renders favorite cards", () => {
    const favorite = createFavorite({ billerName: "EPM", category: "Energía" });
    vi.mocked(useFavoriteBillers).mockReturnValue({
      data: { favorites: [favorite] },
      isLoading: false,
      error: null,
    } as any);

    render(React.createElement(BillFavoritesList));

    expect(screen.getByText("EPM")).toBeInTheDocument();
    expect(screen.getByText("Energía")).toBeInTheDocument();
  });

  it("calls onSelect when a favorite is clicked", () => {
    const onSelect = vi.fn();
    const favorite = createFavorite({ billerId: "biller-123" });
    vi.mocked(useFavoriteBillers).mockReturnValue({
      data: { favorites: [favorite] },
      isLoading: false,
      error: null,
    } as any);

    render(React.createElement(BillFavoritesList, { onSelect }));

    fireEvent.click(screen.getByText("EPM"));
    expect(onSelect).toHaveBeenCalledWith("biller-123");
  });

  it("shows max limit message when 10 favorites exist", () => {
    const favorites = Array.from({ length: 10 }, (_, i) =>
      createFavorite({ id: `fav-${i}`, billerName: `Biller ${i}` })
    );
    vi.mocked(useFavoriteBillers).mockReturnValue({
      data: { favorites },
      isLoading: false,
      error: null,
    } as any);

    render(React.createElement(BillFavoritesList));

    expect(screen.getByText("Máximo 10 favoritos alcanzado")).toBeInTheDocument();
  });

  it("does not show max limit message when less than 10 favorites", () => {
    const favorites = Array.from({ length: 5 }, (_, i) =>
      createFavorite({ id: `fav-${i}`, billerName: `Biller ${i}` })
    );
    vi.mocked(useFavoriteBillers).mockReturnValue({
      data: { favorites },
      isLoading: false,
      error: null,
    } as any);

    render(React.createElement(BillFavoritesList));

    expect(screen.queryByText("Máximo 10 favoritos alcanzado")).not.toBeInTheDocument();
  });

  it("renders category text for each favorite", () => {
    const favorites = [
      createFavorite({ billerName: "EPM", category: "Energía" }),
      createFavorite({ id: "fav-2", billerName: "EAB", category: "Agua" }),
    ];
    vi.mocked(useFavoriteBillers).mockReturnValue({
      data: { favorites },
      isLoading: false,
      error: null,
    } as any);

    render(React.createElement(BillFavoritesList));

    const categories = screen.getAllByText(/Energía|Agua/);
    expect(categories.length).toBe(2);
    expect(screen.getByText("Energía")).toBeInTheDocument();
    expect(screen.getByText("Agua")).toBeInTheDocument();
  });
});
