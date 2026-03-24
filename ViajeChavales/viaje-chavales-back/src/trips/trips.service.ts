import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ProposalStatus, ProposalType, TripRole, TripStatus } from '@prisma/client';
import {
  assertProposalStatus,
  canUserCreateProposal,
  canTripBeClosed,
  ensureApprovedUserForGroup,
  ensureTripParticipantOrPlanner,
  ensureTripPlanner,
  ensureTripPlanning,
  getEligibleVoterIds,
  getGroupRoleLookup,
  getProposalAcceptanceThreshold,
  getTopProposalIds,
  getTripOrThrow,
  serializeProposal,
  tripDetailsInclude,
} from 'src/core/utils/trip-domain';
import { PrismaService } from 'src/db.service';
import { AssignTripRoleDto } from './dto/assign-trip-role.dto';
import { CreateTripDto } from './dto/create-trip.dto';
import { CreateProposalDto } from './dto/proposal.dto';
import { UpdateTripStatusDto } from './dto/update-trip-status.dto';
import { UpdateTripDto } from './dto/update-trip.dto';

type TripWithDetails = Awaited<ReturnType<typeof getTripOrThrow>>;

@Injectable()
export class TripsService {
  constructor(readonly prisma: PrismaService) {}

  private normalizeDates(startDate: Date | string, endDate: Date | string) {
    const start = new Date(startDate);
    const end = new Date(endDate);

    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
      throw new BadRequestException('Invalid trip dates');
    }

    return { start, end };
  }

  private ensureTripDatesAreValid(start: Date, end: Date) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (start >= end || start < today) {
      throw new BadRequestException('Trip dates are invalid');
    }
  }

  private async ensureDatesInsideFreedays(
    username: string,
    start: Date,
    end: Date,
  ) {
    const freeDays = await this.prisma.freeDays.findMany({
      where: { username },
    });

    const fits = freeDays.some(
      (freeDay) => start >= freeDay.startDate && end <= freeDay.endDate,
    );

    if (!fits) {
      throw new BadRequestException(
        'Trip dates must fit inside one of your available free-day ranges',
      );
    }
  }

  private async ensureVisitItemsInsideTrip(
    trip: { startDate: Date; endDate: Date },
    proposal: CreateProposalDto,
  ) {
    for (const item of proposal.visitItems ?? []) {
      const scheduledAt = new Date(item.scheduledAt);
      if (scheduledAt < trip.startDate || scheduledAt > trip.endDate) {
        throw new BadRequestException('Visit dates must be inside the trip range');
      }
    }
  }

  private getProposalItemPayload(proposal: CreateProposalDto) {
    switch (proposal.type) {
      case ProposalType.Accommodation:
        if (!proposal.accommodationItems?.length) {
          throw new BadRequestException('Accommodation proposals require accommodation items');
        }
        if (proposal.transportItems?.length || proposal.visitItems?.length) {
          throw new BadRequestException('Accommodation proposals cannot include other item types');
        }
        return {
          accommodationItems: {
            create: proposal.accommodationItems,
          },
        };
      case ProposalType.Transport:
        if (!proposal.transportItems?.length) {
          throw new BadRequestException('Transport proposals require transport items');
        }
        if (proposal.accommodationItems?.length || proposal.visitItems?.length) {
          throw new BadRequestException('Transport proposals cannot include other item types');
        }
        return {
          transportItems: {
            create: proposal.transportItems,
          },
        };
      case ProposalType.Visit:
        if (!proposal.visitItems?.length) {
          throw new BadRequestException('Visit proposals require visit items');
        }
        if (proposal.accommodationItems?.length || proposal.transportItems?.length) {
          throw new BadRequestException('Visit proposals cannot include other item types');
        }
        return {
          visitItems: {
            create: proposal.visitItems.map((item) => ({
              ...item,
              scheduledAt: new Date(item.scheduledAt),
            })),
          },
        };
    }
  }

  private serializeTrip(trip: TripWithDetails) {
    const groupRoleLookup = getGroupRoleLookup(trip.group.members);
    const eligibleVoterIds = getEligibleVoterIds(trip);
    const acceptanceThreshold = getProposalAcceptanceThreshold(eligibleVoterIds.length);
    const topProposalIdsByType = {
      [ProposalType.Accommodation]: getTopProposalIds(
        trip.proposals.filter(
          (proposal) =>
            proposal.type === ProposalType.Accommodation &&
            proposal.status === ProposalStatus.Proposed,
        ),
      ).proposalIds,
      [ProposalType.Transport]: getTopProposalIds(
        trip.proposals.filter(
          (proposal) =>
            proposal.type === ProposalType.Transport && proposal.status === ProposalStatus.Proposed,
        ),
      ).proposalIds,
      [ProposalType.Visit]: getTopProposalIds(
        trip.proposals.filter(
          (proposal) => proposal.type === ProposalType.Visit && proposal.status === ProposalStatus.Proposed,
        ),
      ).proposalIds,
    };

    return {
      ...trip,
      group: {
        id: trip.group.id,
        name: trip.group.name,
      },
      planner: {
        ...trip.planner,
        userRole: groupRoleLookup.get(trip.planner.username) ?? 'Pending',
      },
      participants: trip.participants.map((participant) => ({
        ...participant,
        user: {
          ...participant.user,
          userRole: groupRoleLookup.get(participant.user.username) ?? 'Pending',
        },
      })),
      tripRoles: trip.tripRoles.map((assignment) => ({
        ...assignment,
        user: {
          ...assignment.user,
          userRole: groupRoleLookup.get(assignment.user.username) ?? 'Pending',
        },
      })),
      eligibleVoterCount: eligibleVoterIds.length,
      proposalAcceptanceThreshold: acceptanceThreshold,
      canBeClosed: canTripBeClosed(trip),
      proposals: trip.proposals.map((proposal) => ({
        ...serializeProposal(proposal),
        isTopVoted: topProposalIdsByType[proposal.type].includes(proposal.id),
        canBeAccepted:
          proposal.status === ProposalStatus.Proposed &&
          topProposalIdsByType[proposal.type].includes(proposal.id) &&
          proposal.votes.length >= acceptanceThreshold,
      })),
      acceptedAccommodationProposal: trip.acceptedAccommodationProposal
        ? serializeProposal(trip.acceptedAccommodationProposal)
        : null,
      acceptedTransportProposal: trip.acceptedTransportProposal
        ? serializeProposal(trip.acceptedTransportProposal)
        : null,
      acceptedVisitProposal: trip.acceptedVisitProposal
        ? serializeProposal(trip.acceptedVisitProposal)
        : null,
    };
  }

  async create(createTripDto: CreateTripDto, plannerUsername: string, groupId: string) {
    await ensureApprovedUserForGroup(this.prisma, plannerUsername, groupId);

    const { start, end } = this.normalizeDates(createTripDto.startDate, createTripDto.endDate);
    this.ensureTripDatesAreValid(start, end);
    await this.ensureDatesInsideFreedays(plannerUsername, start, end);

    const trip = await this.prisma.trip.create({
      data: {
        plannerUsername,
        groupId,
        name: createTripDto.name.trim(),
        destination: createTripDto.destination.trim(),
        details: createTripDto.details?.trim() || null,
        budget: createTripDto.budget ?? null,
        startDate: start,
        endDate: end,
        participants: {
          create: {
            userId: plannerUsername,
          },
        },
      },
      include: tripDetailsInclude,
    });

    return this.serializeTrip(trip);
  }

  async findAll(groupId: string) {
    const trips = await this.prisma.trip.findMany({
      where: { groupId },
      include: tripDetailsInclude,
      orderBy: [{ startDate: 'asc' }, { createdAt: 'desc' }],
    });

    return trips.map((trip) => this.serializeTrip(trip));
  }

  async findOne(id: number, groupId?: string) {
    const trip = await getTripOrThrow(this.prisma, id);

    if (groupId && trip.groupId !== groupId) {
      throw new ForbiddenException('Trip does not belong to requested group');
    }

    return this.serializeTrip(trip);
  }

  async update(id: number, updateTripDto: UpdateTripDto, username: string) {
    const trip = await getTripOrThrow(this.prisma, id);
    ensureTripPlanning(trip);
    ensureTripPlanner(trip, username);

    const nextStart = updateTripDto.startDate ?? trip.startDate;
    const nextEnd = updateTripDto.endDate ?? trip.endDate;
    const { start, end } = this.normalizeDates(nextStart, nextEnd);

    this.ensureTripDatesAreValid(start, end);
    await this.ensureDatesInsideFreedays(username, start, end);

    const visitOutsideRange = trip.proposals.some((proposal) =>
      proposal.visitItems.some((item) => item.scheduledAt < start || item.scheduledAt > end),
    );

    if (visitOutsideRange) {
      throw new BadRequestException(
        'Cannot update trip dates because some visit proposals fall outside the new range',
      );
    }

    const updatedTrip = await this.prisma.trip.update({
      where: { id },
      data: {
        name: updateTripDto.name?.trim() ?? trip.name,
        destination: updateTripDto.destination?.trim() ?? trip.destination,
        details:
          updateTripDto.details !== undefined ? updateTripDto.details?.trim() || null : trip.details,
        budget: updateTripDto.budget !== undefined ? updateTripDto.budget ?? null : trip.budget,
        startDate: start,
        endDate: end,
      },
      include: tripDetailsInclude,
    });

    return this.serializeTrip(updatedTrip);
  }

  async updateStatus(id: number, updateTripStatusDto: UpdateTripStatusDto, username: string) {
    const trip = await getTripOrThrow(this.prisma, id);
    ensureTripPlanner(trip, username);

    if (trip.status !== TripStatus.Planning) {
      throw new ForbiddenException('Closed or discarded trips cannot change state');
    }

    if (updateTripStatusDto.status === TripStatus.Planning) {
      throw new BadRequestException('Trip is already in planning state');
    }

    if (updateTripStatusDto.status === TripStatus.Closed && !canTripBeClosed(trip)) {
      throw new BadRequestException(
        'Trip can only be closed when accommodation, transport and visit proposals are accepted',
      );
    }

    const updatedTrip = await this.prisma.trip.update({
      where: { id },
      data: { status: updateTripStatusDto.status },
      include: tripDetailsInclude,
    });

    return this.serializeTrip(updatedTrip);
  }

  async remove(id: number, username: string) {
    const trip = await getTripOrThrow(this.prisma, id);
    ensureTripPlanning(trip);
    ensureTripPlanner(trip, username);

    return this.prisma.trip.delete({ where: { id } });
  }

  async assignRole(tripId: number, username: string, assignTripRoleDto: AssignTripRoleDto) {
    const trip = await getTripOrThrow(this.prisma, tripId);
    ensureTripPlanning(trip);
    ensureTripPlanner(trip, username);

    if (assignTripRoleDto.userId === trip.plannerUsername) {
      throw new BadRequestException('Planner role is managed by the trip itself');
    }

    const participant = trip.participants.find(
      (currentParticipant) => currentParticipant.userId === assignTripRoleDto.userId,
    );

    if (!participant) {
      throw new BadRequestException('Trip roles can only be assigned to trip participants');
    }

    await ensureApprovedUserForGroup(this.prisma, assignTripRoleDto.userId, trip.groupId);

    await this.prisma.tripRoleAssignment.upsert({
      where: {
        tripId_userId_role: {
          tripId,
          userId: assignTripRoleDto.userId,
          role: assignTripRoleDto.role,
        },
      },
      update: {},
      create: {
        tripId,
        userId: assignTripRoleDto.userId,
        role: assignTripRoleDto.role,
      },
    });

    return this.findOne(tripId);
  }

  async removeRole(tripId: number, username: string, userId: string, role: TripRole) {
    const trip = await getTripOrThrow(this.prisma, tripId);
    ensureTripPlanning(trip);
    ensureTripPlanner(trip, username);

    await this.prisma.tripRoleAssignment.delete({
      where: {
        tripId_userId_role: {
          tripId,
          userId,
          role,
        },
      },
    });

    return this.findOne(tripId);
  }

  async createProposal(tripId: number, username: string, createProposalDto: CreateProposalDto) {
    const trip = await getTripOrThrow(this.prisma, tripId);
    await ensureApprovedUserForGroup(this.prisma, username, trip.groupId);
    ensureTripPlanning(trip);
    ensureTripParticipantOrPlanner(trip, username);

    if (!canUserCreateProposal(trip, username, createProposalDto.type)) {
      throw new ForbiddenException('User does not have the required role for this proposal type');
    }

    const acceptedProposalExists = trip.proposals.some(
      (proposal) =>
        proposal.type === createProposalDto.type && proposal.status === ProposalStatus.Accepted,
    );

    if (acceptedProposalExists) {
      throw new BadRequestException('This proposal type already has an accepted proposal');
    }

    const proposalsForType = trip.proposals.filter((proposal) => proposal.type === createProposalDto.type);
    if (proposalsForType.length >= 3) {
      throw new BadRequestException('This trip already has 3 proposals for this type');
    }

    await this.ensureVisitItemsInsideTrip(trip, createProposalDto);

    await this.prisma.proposal.create({
      data: {
        tripId,
        createdByUsername: username,
        type: createProposalDto.type,
        details: createProposalDto.details?.trim() || null,
        ...this.getProposalItemPayload(createProposalDto),
      },
    });

    return this.findOne(tripId);
  }

  async deleteProposal(tripId: number, proposalId: number, username: string) {
    const trip = await getTripOrThrow(this.prisma, tripId);
    ensureTripPlanning(trip);

    const proposal = trip.proposals.find((currentProposal) => currentProposal.id === proposalId);
    if (!proposal) {
      throw new NotFoundException('Proposal not found');
    }

    if (proposal.createdByUsername !== username) {
      throw new ForbiddenException('Only the proposal creator can delete it');
    }

    assertProposalStatus(proposal, ProposalStatus.Proposed, 'Only proposed items can be deleted');

    await this.prisma.proposal.delete({ where: { id: proposalId } });
    return this.findOne(tripId);
  }

  async addProposalVote(tripId: number, proposalId: number, username: string) {
    const trip = await getTripOrThrow(this.prisma, tripId);
    await ensureApprovedUserForGroup(this.prisma, username, trip.groupId);
    ensureTripPlanning(trip);
    ensureTripParticipantOrPlanner(trip, username);

    const proposal = trip.proposals.find((currentProposal) => currentProposal.id === proposalId);
    if (!proposal) {
      throw new NotFoundException('Proposal not found');
    }

    assertProposalStatus(proposal, ProposalStatus.Proposed, 'Votes are only allowed on proposed items');

    await this.prisma.proposalVote.create({
      data: {
        proposalId,
        userId: username,
      },
    });

    return this.findOne(tripId);
  }

  async removeProposalVote(tripId: number, proposalId: number, username: string) {
    const trip = await getTripOrThrow(this.prisma, tripId);
    ensureTripPlanning(trip);
    ensureTripParticipantOrPlanner(trip, username);

    const proposal = trip.proposals.find((currentProposal) => currentProposal.id === proposalId);
    if (!proposal) {
      throw new NotFoundException('Proposal not found');
    }

    assertProposalStatus(proposal, ProposalStatus.Proposed, 'Votes can only be removed from proposed items');

    await this.prisma.proposalVote.delete({
      where: {
        proposalId_userId: {
          proposalId,
          userId: username,
        },
      },
    });

    return this.findOne(tripId);
  }

  async updateProposalStatus(
    tripId: number,
    proposalId: number,
    username: string,
    status: ProposalStatus,
  ) {
    const trip = await getTripOrThrow(this.prisma, tripId);
    ensureTripPlanning(trip);
    ensureTripPlanner(trip, username);

    const proposal = trip.proposals.find((currentProposal) => currentProposal.id === proposalId);
    if (!proposal) {
      throw new NotFoundException('Proposal not found');
    }

    if (status === ProposalStatus.Denied) {
      throw new BadRequestException('Denied is only set automatically when another proposal is accepted');
    }

    if (status === ProposalStatus.Proposed) {
      if (proposal.status !== ProposalStatus.Accepted) {
        throw new BadRequestException('Only accepted proposals can be rolled back to proposed');
      }

      await this.prisma.$transaction(async (tx) => {
        await tx.proposal.updateMany({
          where: {
            tripId,
            type: proposal.type,
          },
          data: {
            status: ProposalStatus.Proposed,
          },
        });

        await tx.trip.update({
          where: { id: tripId },
          data:
            proposal.type === ProposalType.Accommodation
              ? { acceptedAccommodationProposalId: null }
              : proposal.type === ProposalType.Transport
                ? { acceptedTransportProposalId: null }
                : { acceptedVisitProposalId: null },
        });
      });

      return this.findOne(tripId);
    }

    if (proposal.status !== ProposalStatus.Proposed) {
      throw new BadRequestException('Only proposed items can be accepted');
    }

    const proposalsForType = trip.proposals.filter(
      (currentProposal) =>
        currentProposal.type === proposal.type && currentProposal.status === ProposalStatus.Proposed,
    );
    const topProposalIds = getTopProposalIds(proposalsForType).proposalIds;
    const eligibleVoterIds = getEligibleVoterIds(trip);
    const threshold = getProposalAcceptanceThreshold(eligibleVoterIds.length);

    if (!topProposalIds.includes(proposalId)) {
      throw new BadRequestException('Planner can only accept the most voted proposal of this type');
    }

    if (proposal.votes.length < threshold) {
      throw new BadRequestException('This proposal does not meet the 2/3 vote threshold');
    }

    const alreadyAccepted = trip.proposals.some(
      (currentProposal) =>
        currentProposal.type === proposal.type && currentProposal.status === ProposalStatus.Accepted,
    );

    if (alreadyAccepted) {
      throw new BadRequestException('This proposal type already has an accepted proposal');
    }

    await this.prisma.$transaction(async (tx) => {
      await tx.proposal.update({
        where: { id: proposalId },
        data: {
          status: ProposalStatus.Accepted,
        },
      });

      await tx.proposal.updateMany({
        where: {
          tripId,
          type: proposal.type,
          id: {
            not: proposalId,
          },
        },
        data: {
          status: ProposalStatus.Denied,
        },
      });

      await tx.trip.update({
        where: { id: tripId },
        data:
          proposal.type === ProposalType.Accommodation
            ? { acceptedAccommodationProposalId: proposalId }
            : proposal.type === ProposalType.Transport
              ? { acceptedTransportProposalId: proposalId }
              : { acceptedVisitProposalId: proposalId },
      });
    });

    return this.findOne(tripId);
  }

  async getTripParticipants(tripId: number) {
    const trip = await getTripOrThrow(this.prisma, tripId);
    return trip.participants;
  }

  async addParticipant(tripId: number, username: string) {
    const trip = await getTripOrThrow(this.prisma, tripId);
    await ensureApprovedUserForGroup(this.prisma, username, trip.groupId);
    ensureTripPlanning(trip);

    if (trip.participants.some((participant) => participant.userId === username)) {
      throw new BadRequestException('User is already part of this trip');
    }

    await this.prisma.participant.create({
      data: {
        tripId,
        userId: username,
      },
    });

    return this.findOne(tripId);
  }

  async removeParticipant(tripId: number, username: string) {
    const trip = await getTripOrThrow(this.prisma, tripId);
    ensureTripPlanning(trip);

    if (trip.plannerUsername === username) {
      throw new ForbiddenException('Planner cannot leave the trip they created');
    }

    const hasProposals = trip.proposals.some((proposal) => proposal.createdByUsername === username);
    if (hasProposals) {
      throw new ForbiddenException('Users with proposals in the trip cannot leave it');
    }

    await this.prisma.$transaction(async (tx) => {
      await tx.proposalVote.deleteMany({
        where: {
          userId: username,
          proposal: {
            tripId,
          },
        },
      });

      await tx.tripRoleAssignment.deleteMany({
        where: {
          tripId,
          userId: username,
        },
      });

      await tx.participant.delete({
        where: {
          userId_tripId: {
            userId: username,
            tripId,
          },
        },
      });
    });

    return this.findOne(tripId);
  }
}
