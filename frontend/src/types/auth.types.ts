export type AddressType = "Home" | "Work" | "Other";

export interface CustomerAddress {
  id: string;
  label?: string;
  house: string;
  street: string;
  locality: string;
  landmark?: string;
  city: string;
  state: string;
  pincode: string;
  addressType: AddressType;
  isDefault: boolean;
  latitude?: number;
  longitude?: number;
  fullAddress: string;
}

export interface AuthUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  avatarUrl?: string;
  mobile: string;
  addresses: CustomerAddress[];
  defaultAddressId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface RegisterPayload extends LoginCredentials {
  firstName: string;
  lastName: string;
  mobile: string;
  address: Omit<CustomerAddress, "id" | "isDefault" | "fullAddress"> & {
    landmark?: string;
    latitude?: number;
    longitude?: number;
  };
}

export interface UpdateProfileInput {
  firstName?: string;
  lastName?: string;
  mobile?: string;
}
