import { describe, expect, it } from "vitest";
import { isValidIndianPhone, isValidPinCode, toAuthUser } from "@/services/auth.service";

describe("toAuthUser", () => {
  it("maps a profile row and drops an empty default address", () => {
    const user = toAuthUser("ada@example.com", {
      id: "user-1",
      first_name: "Ada",
      last_name: "Bose",
      mobile: "9876543210",
      addresses: [],
      default_address_id: null,
      created_at: "2026-01-01T00:00:00.000Z",
      updated_at: "2026-01-02T00:00:00.000Z",
    });

    expect(user).toEqual({
      id: "user-1",
      firstName: "Ada",
      lastName: "Bose",
      email: "ada@example.com",
      mobile: "9876543210",
      addresses: [],
      createdAt: "2026-01-01T00:00:00.000Z",
      updatedAt: "2026-01-02T00:00:00.000Z",
    });
    expect(user.defaultAddressId).toBeUndefined();
  });
});

describe("customer contact validation", () => {
  it("accepts Indian mobile and PIN formats and rejects invalid prefixes", () => {
    expect(isValidIndianPhone("+91 98765 43210")).toBe(true);
    expect(isValidIndianPhone("1234567890")).toBe(false);
    expect(isValidPinCode("700001")).toBe(true);
    expect(isValidPinCode("000000")).toBe(false);
    expect(isValidPinCode("12345")).toBe(false);
  });
});
