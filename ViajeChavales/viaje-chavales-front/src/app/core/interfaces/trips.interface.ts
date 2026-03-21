import { UserRole } from './user.interface';

export type TripRole = 'Accommodation' | 'Transport' | 'Visits';
export type TripStatus = 'Planning' | 'Closed' | 'Discarded';
export type ProposalType = 'Accommodation' | 'Transport' | 'Visit';
export type ProposalStatus = 'Proposed' | 'Accepted' | 'Denied';

export interface CreateTripDto {
  name: string;
  destination: string;
  startDate: Date;
  endDate: Date;
  details?: string;
  budget?: number;
}

export interface Participant {
  userId: string;
  tripId: number;
  createdAt: string;
  user: {
    username: string;
    profilePicture: string;
    userRole: UserRole;
  };
}

export interface TripRoleAssignment {
  tripId: number;
  userId: string;
  role: TripRole;
  createdAt: string;
  updatedAt: string;
  user: {
    username: string;
    profilePicture: string;
    userRole: UserRole;
  };
}

export interface ProposalVote {
  proposalId: number;
  userId: string;
  createdAt: string;
}

export interface AccommodationProposalObject {
  id?: number;
  name: string;
  place: string;
  nights: number;
  pricePerPersonCents: number;
  referenceLink?: string | null;
  details?: string | null;
}

export interface TransportProposalObject {
  id?: number;
  name: string;
  origin: string;
  destination: string;
  pricePerPersonCents: number;
  referenceLink?: string | null;
  details?: string | null;
}

export interface VisitProposalObject {
  id?: number;
  name: string;
  category: string;
  scheduledAt: string;
  durationMinutes: number;
  pricePerPersonCents: number;
  referenceLink?: string | null;
  details?: string | null;
}

export interface Proposal {
  id: number;
  tripId: number;
  createdByUsername: string;
  type: ProposalType;
  status: ProposalStatus;
  details?: string | null;
  createdAt: string;
  updatedAt: string;
  votes: ProposalVote[];
  accommodationItems: AccommodationProposalObject[];
  transportItems: TransportProposalObject[];
  visitItems: VisitProposalObject[];
  voteCount: number;
  totalPricePerPersonCents: number;
  isTopVoted: boolean;
  canBeAccepted: boolean;
}

export interface Comment {
  id?: number;
  userId: string;
  tripId: number;
  comment: string;
  createdAt?: string;
  user?: {
    username: string;
    profilePicture: string;
  };
  profilePicture?: string;
}

export interface Trip {
  id: number;
  groupId: string;
  plannerUsername: string;
  name: string;
  destination: string;
  details?: string | null;
  budget?: number | null;
  status: TripStatus;
  startDate: string;
  endDate: string;
  createdAt: string;
  updatedAt: string;
  planner: {
    username: string;
    profilePicture: string;
    userRole: UserRole;
  };
  group: {
    id: string;
    name: string;
  };
  participants: Participant[];
  tripRoles: TripRoleAssignment[];
  comments: Comment[];
  proposals: Proposal[];
  eligibleVoterCount: number;
  proposalAcceptanceThreshold: number;
  canBeClosed: boolean;
  acceptedAccommodationProposal: Proposal | null;
  acceptedTransportProposal: Proposal | null;
  acceptedVisitProposal: Proposal | null;
}

export interface CreateProposalDto {
  type: ProposalType;
  details?: string;
  accommodationItems?: AccommodationProposalObject[];
  transportItems?: TransportProposalObject[];
  visitItems?: VisitProposalObject[];
}
