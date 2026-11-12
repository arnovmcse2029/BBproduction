import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => {
  const reload = vi.fn();
  return {
    reload,
    store: {
      orders: [],
      updateOrderStatus: vi.fn(),
      error: null as string | null,
      ready: true,
      reload,
    },
  };
});

vi.mock("@/context/store", () => ({
  useStore: () => mocks.store,
}));

import { AdminOrders } from "@/components/admin/AdminPages";

describe("AdminOrders", () => {
  beforeEach(() => {
    mocks.reload.mockReset();
    mocks.store.error = null;
    mocks.store.ready = true;
  });

  it("reloads order data when refresh is clicked", () => {
    render(<AdminOrders />);

    fireEvent.click(screen.getByRole("button", { name: "Refresh orders" }));

    expect(mocks.reload).toHaveBeenCalledOnce();
  });

  it("shows a load error instead of presenting it as an empty result", () => {
    mocks.store.error = "Orders are unavailable.";

    render(<AdminOrders />);

    expect(screen.getByRole("alert")).toHaveTextContent("Orders are unavailable.");
    expect(screen.getByText("Data could not be loaded. Refresh to try again.")).toBeInTheDocument();
  });
});
