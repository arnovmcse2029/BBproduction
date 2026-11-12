import { createFileRoute } from "@tanstack/react-router";
import { MapPin, Pencil, Plus, Trash2, CheckCircle2 } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { PageHeader, SiteLayout } from "@/components/site/SiteLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/context/AuthContext";
import { requireCustomer } from "@/lib/auth.server";
import type { CustomerAddress } from "@/types/auth.types";

const emptyDraft = {
  house: "",
  street: "",
  locality: "",
  landmark: "",
  city: "",
  state: "",
  pincode: "",
  addressType: "Home" as const,
};

type AddressDraft = Omit<typeof emptyDraft, "addressType"> & {
  addressType: CustomerAddress["addressType"];
};

export const Route = createFileRoute("/addresses")({
  validateSearch: (search: Record<string, unknown>) => ({
    return: typeof search["return"] === "string" ? search["return"] : undefined,
  }),
  beforeLoad: ({ location }) => requireCustomer(location.href),
  head: () => ({
    meta: [
      { title: "My addresses — Biriyani Babu" },
      { name: "description", content: "Manage your saved delivery addresses." },
    ],
  }),
  component: AddressesPage,
});

function AddressesPage() {
  const {
    addresses,
    addAddress,
    updateAddress,
    deleteAddress,
    setDefaultAddress,
    profileError,
    getCurrentUser,
  } = useAuth();
  const returnTo = Route.useSearch().return ?? "/profile";
  const [draft, setDraft] = useState<AddressDraft>(emptyDraft);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isReloading, setIsReloading] = useState(false);

  const sortedAddresses = useMemo(
    () => [...addresses].sort((a, b) => Number(b.isDefault) - Number(a.isDefault)),
    [addresses],
  );

  const onFieldChange = (key: keyof AddressDraft, value: string) =>
    setDraft((current) => ({ ...current, [key]: value }));

  const resetDraft = () => {
    setDraft(emptyDraft);
    setEditingId(null);
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSaving(true);
    try {
      const input = {
        house: draft.house,
        street: draft.street,
        locality: draft.locality,
        landmark: draft.landmark,
        city: draft.city,
        state: draft.state,
        pincode: draft.pincode,
        addressType: draft.addressType,
      };

      if (editingId) {
        await updateAddress(editingId, input);
        toast.success("Address updated.");
      } else {
        await addAddress(input);
        toast.success("New address added.");
      }
      resetDraft();
    } catch (error) {
      const message = error instanceof Error ? error.message : "Something went wrong.";
      toast.error(message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleEdit = (address: CustomerAddress) => {
    setEditingId(address.id);
    setDraft({
      house: address.house,
      street: address.street,
      locality: address.locality,
      landmark: address.landmark ?? "",
      city: address.city,
      state: address.state,
      pincode: address.pincode,
      addressType: address.addressType,
    });
  };

  const handleDelete = async (addressId: string) => {
    try {
      await deleteAddress(addressId);
      toast.success("Address removed.");
      if (editingId === addressId) resetDraft();
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unable to delete this address.";
      toast.error(message);
    }
  };

  const handleDefault = async (addressId: string) => {
    try {
      await setDefaultAddress(addressId);
      toast.success("Default address updated.");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unable to update default address.";
      toast.error(message);
    }
  };

  return (
    <ProtectedRoute>
      <SiteLayout>
        <PageHeader
          eyebrow="Account"
          title="My addresses"
          description="Manage all saved delivery locations for your orders."
        />
        <div className="container-page py-12">
          {profileError && (
            <div
              className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive"
              role="alert"
            >
              <span>{profileError}</span>
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={isReloading}
                onClick={async () => {
                  setIsReloading(true);
                  try {
                    await getCurrentUser();
                  } catch (error) {
                    toast.error(
                      error instanceof Error ? error.message : "Unable to reload your addresses.",
                    );
                  } finally {
                    setIsReloading(false);
                  }
                }}
              >
                {isReloading ? "Loading..." : "Try again"}
              </Button>
            </div>
          )}
          <div className="grid gap-8 lg:grid-cols-[0.95fr_1.05fr]">
            <div className="rounded-3xl border border-border bg-card p-6 shadow-card">
              <div className="mb-5 flex items-center justify-between gap-3">
                <h2 className="text-xl font-semibold">
                  {editingId ? "Edit address" : "Add new address"}
                </h2>
                {editingId && (
                  <Button type="button" variant="outline" size="sm" onClick={resetDraft}>
                    Cancel
                  </Button>
                )}
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="sm:col-span-2 space-y-2">
                    <Label htmlFor="house">House / flat / building</Label>
                    <Input
                      id="house"
                      required
                      maxLength={120}
                      value={draft.house}
                      onChange={(event) => onFieldChange("house", event.target.value)}
                    />
                  </div>
                  <div className="sm:col-span-2 space-y-2">
                    <Label htmlFor="street">Street / road</Label>
                    <Input
                      id="street"
                      required
                      maxLength={120}
                      value={draft.street}
                      onChange={(event) => onFieldChange("street", event.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="locality">Locality / area</Label>
                    <Input
                      id="locality"
                      required
                      maxLength={120}
                      value={draft.locality}
                      onChange={(event) => onFieldChange("locality", event.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="landmark">Landmark</Label>
                    <Input
                      id="landmark"
                      maxLength={120}
                      value={draft.landmark}
                      onChange={(event) => onFieldChange("landmark", event.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="city">City</Label>
                    <Input
                      id="city"
                      required
                      maxLength={80}
                      value={draft.city}
                      onChange={(event) => onFieldChange("city", event.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="state">State</Label>
                    <Input
                      id="state"
                      required
                      maxLength={80}
                      value={draft.state}
                      onChange={(event) => onFieldChange("state", event.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="pincode">PIN code</Label>
                    <Input
                      id="pincode"
                      required
                      inputMode="numeric"
                      pattern="[1-9][0-9]{5}"
                      maxLength={6}
                      value={draft.pincode}
                      onChange={(event) => onFieldChange("pincode", event.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="addressType">Address type</Label>
                    <select
                      id="addressType"
                      value={draft.addressType}
                      onChange={(event) =>
                        onFieldChange(
                          "addressType",
                          event.target.value as AddressDraft["addressType"],
                        )
                      }
                      className="flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
                    >
                      <option value="Home">Home</option>
                      <option value="Work">Work</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>

                <Button
                  type="submit"
                  variant="gold"
                  size="xl"
                  className="w-full rounded-xl"
                  disabled={isSaving}
                >
                  {isSaving ? "Saving..." : editingId ? "Update address" : "Save address"}
                </Button>
              </form>
            </div>

            <div className="rounded-3xl border border-border bg-card p-6 shadow-card">
              <div className="mb-4 flex items-center justify-between gap-3">
                <h2 className="text-xl font-semibold">Saved addresses</h2>
                <Button asChild variant="outline" size="sm">
                  <a href={returnTo === "/profile" ? "/profile" : returnTo}>
                    {returnTo === "/profile" ? "Back to profile" : "Back to checkout"}
                  </a>
                </Button>
              </div>

              {sortedAddresses.length === 0 ? (
                <div className="rounded-2xl border border-dashed p-6 text-center text-muted-foreground">
                  <MapPin className="mx-auto mb-3 h-6 w-6 text-gold" />
                  <p>No addresses saved yet.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {sortedAddresses.map((address) => (
                    <div key={address.id} className="rounded-2xl border border-border p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-semibold">{address.addressType}</p>
                            {address.isDefault && (
                              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[0.7rem] font-semibold text-emerald-700">
                                <CheckCircle2 className="h-3 w-3" />
                                Default
                              </span>
                            )}
                          </div>
                          <p className="mt-2 text-sm text-foreground">
                            {address.house}, {address.street}, {address.locality}
                          </p>
                          {address.landmark && (
                            <p className="text-sm text-foreground">{address.landmark}</p>
                          )}
                          <p className="text-sm text-foreground">
                            {address.city}, {address.state} - {address.pincode}
                          </p>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            onClick={() => handleEdit(address)}
                          >
                            <Pencil className="h-3.5 w-3.5" />
                            Edit
                          </Button>
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            onClick={() => handleDelete(address.id)}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                            Delete
                          </Button>
                        </div>
                      </div>

                      {!address.isDefault && (
                        <div className="mt-4">
                          <Button
                            type="button"
                            size="sm"
                            variant="gold"
                            onClick={() => handleDefault(address.id)}
                          >
                            <Plus className="h-3.5 w-3.5" />
                            Set as default
                          </Button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </SiteLayout>
    </ProtectedRoute>
  );
}
