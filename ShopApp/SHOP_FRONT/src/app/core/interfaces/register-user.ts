interface RegisterBusinessUser extends UserCredentials {
    businessName: string
    country: string
}

interface RegisterPersonalUser extends UserCredentials{
    firstName: string
    lastName: string
}

export interface UserCredentials {
    email: string
    password: string
}

export type RegisterUserType = RegisterBusinessUser | RegisterPersonalUser;

