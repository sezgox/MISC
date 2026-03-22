export interface Group {
  id: string;
  name: string;
}

export interface GroupInviteMember {
  username: string;
  profilePicture: string;
  userRole: 'Pending' | 'Tripper' | 'Admin';
}

export interface GroupInvitePreview {
  id: string;
  name: string;
  createdAt: string;
  members: GroupInviteMember[];
}
