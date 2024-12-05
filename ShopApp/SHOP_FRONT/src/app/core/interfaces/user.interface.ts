
interface PersonalAccount {
  email: string;
  firstName: string;
  lastName: string;
  role: "PERSONAL"
}
interface BussinessAccount {
  email: string;
  businessName: string;
  country: string;
  role: "BUSINESS"
}

export type User = PersonalAccount | BussinessAccount;
