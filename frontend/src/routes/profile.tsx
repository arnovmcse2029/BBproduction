import { createFileRoute } from "@tanstack/react-router";
import { Save, UserRound } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { PageHeader, SiteLayout } from "@/components/site/SiteLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/context/AuthContext";
import { requireCustomer } from "@/lib/auth.server";

export const Route = createFileRoute("/profile")({
  beforeLoad: ({ location }) => requireCustomer(location.href),
  head: () => ({
    meta: [
      { title: "My profile — Biriyani Babu" },
      { name: "description", content: "Manage your Biriyani Babu customer profile." },
    ],
  }),
  component: ProfilePage,
});

function ProfilePage() {
  const { user, updateProfile, addresses } = useAuth();
  const [firstName, setFirstName] = useState(user?.firstName ?? "");
  const [lastName, setLastName] = useState(user?.lastName ?? "");
  const [mobile, setMobile] = useState(user?.mobile ?? "");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!user) return;
    setFirstName(user.firstName);
    setLastName(user.lastName);
    setMobile(user.mobile);
  }, [user]);

  const defaultAddress =
    addresses.find((address) => address.id === user?.defaultAddressId) ?? addresses[0];

  const handleSave = async () => {
    try {
      setIsSaving(true);
      await updateProfile({ firstName, lastName, mobile });
      toast.success("Profile updated successfully.");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unable to save your profile.";
      toast.error(message);
    } finally {
      setIsSaving(false);
    }
  };

  if (!user) return null;

  return (
    <ProtectedRoute>
      <SiteLayout>
        <PageHeader
          eyebrow="Account"
          title="My profile"
          description="Keep your details updated for faster checkout and deliveries."
        />
        <div className="container-page py-12">
          <div className="grid gap-8 lg:grid-cols-[1.3fr_0.7fr]">
            <div className="rounded-3xl border border-border bg-card p-6 shadow-card md:p-8">
              <div className="mb-6 flex items-center gap-3">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={user.avatarUrl} alt="" referrerPolicy="no-referrer" />
                  <AvatarFallback className="bg-gold/10 text-gold">
                    <UserRound className="h-5 w-5" />
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm uppercase tracking-[0.18em] text-muted-foreground">
                    Customer
                  </p>
                  <h2 className="text-xl font-semibold">
                    {user.firstName} {user.lastName}
                  </h2>
                </div>
              </div>

              <div className="grid gap-5 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First name</Label>
                  <Input
                    id="firstName"
                    value={firstName}
                    onChange={(event) => setFirstName(event.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last name</Label>
                  <Input
                    id="lastName"
                    value={lastName}
                    onChange={(event) => setLastName(event.target.value)}
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="email">Email address</Label>
                  <Input id="email" value={user.email} disabled />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="mobile">Mobile number</Label>
                  <Input
                    id="mobile"
                    value={mobile}
                    onChange={(event) => setMobile(event.target.value)}
                  />
                </div>
              </div>

              <div className="mt-6 flex flex-wrap gap-3">
                <Button
                  type="button"
                  variant="gold"
                  size="lg"
                  onClick={handleSave}
                  disabled={isSaving}
                >
                  <Save className="h-4 w-4" />
                  {isSaving ? "Saving..." : "Save profile"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="lg"
                  onClick={() => {
                    setFirstName(user.firstName);
                    setLastName(user.lastName);
                    setMobile(user.mobile);
                  }}
                >
                  Cancel
                </Button>
              </div>
            </div>

            <div className="rounded-3xl border border-border bg-card p-6 shadow-card h-fit">
              <p className="text-sm uppercase tracking-[0.18em] text-muted-foreground">
                Default address
              </p>
              {defaultAddress ? (
                <div className="mt-4 space-y-2 text-sm text-foreground">
                  <p className="font-semibold">{defaultAddress.addressType}</p>
                  <p>
                    {defaultAddress.house}, {defaultAddress.street}, {defaultAddress.locality}
                  </p>
                  {defaultAddress.landmark && <p>{defaultAddress.landmark}</p>}
                  <p>
                    {defaultAddress.city}, {defaultAddress.state} - {defaultAddress.pincode}
                  </p>
                </div>
              ) : (
                <p className="mt-4 text-sm text-muted-foreground">No address saved yet.</p>
              )}
            </div>
          </div>
        </div>
      </SiteLayout>
    </ProtectedRoute>
  );
}
