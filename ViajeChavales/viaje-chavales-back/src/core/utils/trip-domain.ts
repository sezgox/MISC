import {
  BadRequestException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import {
  Prisma,
  PrismaClient,
  ProposalStatus,
  ProposalType,
  TripRole,
  TripStatus,
  UserRole,
} from '@prisma/client';

type PrismaLike = PrismaClient | Prisma.TransactionClient;

export const tripDetailsInclude = {
  planner: {
    select: {
      username: true,
      profilePicture: true,
      userRole: true,
    },
  },
  group: {
    select: {
      id: true,
      name: true,
    },
  },
  participants: {
    include: {
      user: {
        select: {
          username: true,
          profilePicture: true,
          userRole: true,
        },
      },
    },
  },
  tripRoles: {
    include: {
      user: {
        select: {
          username: true,
          profilePicture: true,
          userRole: true,
        },
      },
    },
  },
  comments: {
    include: {
      user: {
        select: {
          username: true,
          profilePicture: true,
        },
      },
    },
    orderBy: {
      createdAt: 'asc',
    },
  },
  proposals: {
    include: {
      votes: true,
      accommodationItems: true,
      transportItems: true,
      visitItems: true,
    },
    orderBy: {
      createdAt: 'desc',
    },
  },
  acceptedAccommodationProposal: {
    include: {
      votes: true,
      accommodationItems: true,
    },
  },
  acceptedTransportProposal: {
    include: {
      votes: true,
      transportItems: true,
    },
  },
  acceptedVisitProposal: {
    include: {
      votes: true,
      visitItems: true,
    },
  },
} satisfies Prisma.TripInclude;

export async function getUserOrThrow(prisma: PrismaLike, username: string) {
  const user = await prisma.user.findUnique({ where: { username } });
  if (!user) {
    throw new NotFoundException('User not found');
  }
  return user;
}

export async function ensureApprovedUser(prisma: PrismaLike, username: string) {
  const user = await getUserOrThrow(prisma, username);
  if (user.userRole === UserRole.Pending) {
    throw new ForbiddenException('Pending users cannot perform this action');
  }
  return user;
}

export async function ensureGroupAdmin(prisma: PrismaLike, username: string, groupId: string) {
  const user = await ensureApprovedUser(prisma, username);
  if (user.groupId !== groupId || user.userRole !== UserRole.Admin) {
    throw new ForbiddenException('Only group admins can perform this action');
  }
  return user;
}

export async function getTripOrThrow(prisma: PrismaLike, tripId: number) {
  const trip = await prisma.trip.findUnique({
    where: { id: tripId },
    include: tripDetailsInclude,
  });

  if (!trip) {
    throw new NotFoundException('Trip not found');
  }

  return trip;
}

export function ensureTripPlanning(trip: { status: TripStatus }) {
  if (trip.status !== TripStatus.Planning) {
    throw new ForbiddenException('This trip does not accept changes');
  }
}

export function ensureTripPlanner(trip: { plannerUsername: string }, username: string) {
  if (trip.plannerUsername !== username) {
    throw new ForbiddenException('Only the trip planner can perform this action');
  }
}

export function isTripParticipant(trip: { participants: { userId: string }[] }, username: string) {
  return trip.participants.some((participant) => participant.userId === username);
}

export function ensureTripParticipantOrPlanner(
  trip: { plannerUsername: string; participants: { userId: string }[] },
  username: string,
) {
  if (trip.plannerUsername === username) {
    return;
  }

  if (!isTripParticipant(trip, username)) {
    throw new ForbiddenException('User is not part of this trip');
  }
}

export function getEligibleVoterIds(trip: {
  plannerUsername: string;
  participants: { userId: string }[];
}) {
  const ids = new Set(trip.participants.map((participant) => participant.userId));
  ids.add(trip.plannerUsername);
  return Array.from(ids);
}

export function getProposalAcceptanceThreshold(voterCount: number) {
  return Math.ceil((voterCount * 2) / 3);
}

export function canTripBeClosed(trip: {
  acceptedAccommodationProposalId?: number | null;
  acceptedTransportProposalId?: number | null;
  acceptedVisitProposalId?: number | null;
}) {
  return !!(
    trip.acceptedAccommodationProposalId &&
    trip.acceptedTransportProposalId &&
    trip.acceptedVisitProposalId
  );
}

export function getProposalTotalPriceCents(proposal: {
  accommodationItems?: { pricePerPersonCents: number }[];
  transportItems?: { pricePerPersonCents: number }[];
  visitItems?: { pricePerPersonCents: number }[];
}) {
  return [
    ...(proposal.accommodationItems ?? []),
    ...(proposal.transportItems ?? []),
    ...(proposal.visitItems ?? []),
  ].reduce((sum, item) => sum + item.pricePerPersonCents, 0);
}

export function getAllowedProposalRoles(type: ProposalType): TripRole[] {
  switch (type) {
    case ProposalType.Accommodation:
      return [TripRole.Accommodation];
    case ProposalType.Transport:
      return [TripRole.Transport];
    case ProposalType.Visit:
      return [TripRole.Visits];
  }
}

export function canUserCreateProposal(
  trip: { plannerUsername: string; tripRoles: { userId: string; role: TripRole }[] },
  username: string,
  type: ProposalType,
) {
  if (trip.plannerUsername === username) {
    return true;
  }

  const allowedRoles = getAllowedProposalRoles(type);
  return trip.tripRoles.some(
    (assignment) => assignment.userId === username && allowedRoles.includes(assignment.role),
  );
}

export function assertProposalStatus(
  proposal: { status: ProposalStatus },
  status: ProposalStatus,
  message: string,
) {
  if (proposal.status !== status) {
    throw new BadRequestException(message);
  }
}

export function countVotesForProposal(
  proposals: {
    id: number;
    votes: { userId: string }[];
  }[],
  proposalId: number,
) {
  return proposals.find((proposal) => proposal.id === proposalId)?.votes.length ?? 0;
}

export function getTopProposalIds(
  proposals: {
    id: number;
    votes: { userId: string }[];
  }[],
) {
  let maxVotes = -1;
  const topIds: number[] = [];

  for (const proposal of proposals) {
    const voteCount = proposal.votes.length;
    if (voteCount > maxVotes) {
      maxVotes = voteCount;
      topIds.length = 0;
      topIds.push(proposal.id);
      continue;
    }

    if (voteCount === maxVotes) {
      topIds.push(proposal.id);
    }
  }

  return {
    maxVotes,
    proposalIds: topIds,
  };
}

export function serializeProposal(
  proposal: {
    id: number;
    tripId: number;
    createdByUsername: string;
    type: ProposalType;
    status: ProposalStatus;
    details: string | null;
    createdAt: Date;
    updatedAt: Date;
    votes: { userId: string }[];
    accommodationItems?: AccommodationProposalObjectLike[];
    transportItems?: TransportProposalObjectLike[];
    visitItems?: VisitProposalObjectLike[];
  },
) {
  return {
    ...proposal,
    voteCount: proposal.votes.length,
    totalPricePerPersonCents: getProposalTotalPriceCents(proposal),
  };
}

type AccommodationProposalObjectLike = {
  id: number;
  name: string;
  place: string;
  nights: number;
  pricePerPersonCents: number;
  referenceLink: string | null;
  details: string | null;
};

type TransportProposalObjectLike = {
  id: number;
  name: string;
  origin: string;
  destination: string;
  pricePerPersonCents: number;
  referenceLink: string | null;
  details: string | null;
};

type VisitProposalObjectLike = {
  id: number;
  name: string;
  category: string;
  scheduledAt: Date;
  durationMinutes: number;
  pricePerPersonCents: number;
  referenceLink: string | null;
  details: string | null;
};
