export type UserRole = 'Pending' | 'Tripper' | 'Admin';

export interface UserCredentials {
  username: string;
  password: string;
}

export interface User extends UserCredentials {
  profilePicture: string;
  groupId: string;
}

export interface UserProfile {
  username: string;
  profilePicture: string;
  groupId: string;
  userRole: UserRole;
  createdAt: string;
  updatedAt: string;
}
