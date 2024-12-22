import { AccountType } from "../consts/user-role.enum";

interface PersonalAccount {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  role: AccountType.Personal
}
interface BussinessAccount {
  id: number;
  email: string;
  businessName: string;
  country: string;
  role: AccountType.Business
}

export type User = PersonalAccount | BussinessAccount;
