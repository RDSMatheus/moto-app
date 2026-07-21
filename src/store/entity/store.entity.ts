export interface NewStore {
  name: string;
  email: string;
  password: string;
  phone: string;
  street: string;
  number: string;
  neighborhood: string;
  city: string;
  state: string;
  zipCode: string;
  complement?: string;
  tenantId?: string;
  cpfCnpj: string;
  latitude: number;
  longitude: number;
}
