import { render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  listOrders: vi.fn(),
  listProducts: vi.fn(),
  listCategories: vi.fn(),
  getSettings: vi.fn(),
}));

vi.mock("@tanstack/react-router", () => ({
  useRouterState: () => "/admin/orders",
}));

vi.mock("@/context/AuthContext", () => ({
  useAuth: () => ({ user: { id: "admin-1" }, isLoading: false }),
}));

vi.mock("@/lib/supabase", () => ({
  isSupabaseConfigured: () => true,
}));

vi.mock("@/services/orders.service", () => ({
  ordersService: { list: mocks.listOrders },
}));

vi.mock("@/services/products.service", () => ({
  productsService: { list: mocks.listProducts, listCategories: mocks.listCategories },
}));

vi.mock("@/services/admin.service", () => ({
  adminService: { getSettings: mocks.getSettings },
}));

import { StoreProvider, useStore } from "@/context/store";

function StoreState() {
  const { orders, error } = useStore();
  return (
    <>
      <p>{orders.length} orders loaded</p>
      {error && <p role="alert">{error}</p>}
    </>
  );
}

describe("StoreProvider admin order loading", () => {
  beforeEach(() => {
    mocks.listOrders.mockReset().mockResolvedValue([{ id: "BB-261112-4AC32B10" }]);
    mocks.listProducts.mockReset().mockRejectedValue(new Error("public.products is missing"));
    mocks.listCategories.mockReset().mockResolvedValue([]);
    mocks.getSettings.mockReset().mockResolvedValue({});
  });

  it("keeps loaded orders available when the separate admin catalog is missing", async () => {
    render(
      <StoreProvider>
        <StoreState />
      </StoreProvider>,
    );

    await waitFor(() => expect(screen.getByText("1 orders loaded")).toBeInTheDocument());

    expect(mocks.listOrders).toHaveBeenCalledOnce();
    expect(screen.getByRole("alert")).toHaveTextContent("public.products is missing");
  });
});
