import { AccountType } from "../consts/user-role.enum";

interface PersonalAccount {
  email: string;
  firstName: string;
  lastName: string;
  role: AccountType.Personal
}
interface BussinessAccount {
  email: string;
  businessName: string;
  country: string;
  role: AccountType.Business
}

export type User = PersonalAccount | BussinessAccount;
