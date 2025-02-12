export interface UserCredentials {
  username: string;
  password: string;
}

export interface User extends UserCredentials {
  profilePicture: string;
  groupId: string;
}
