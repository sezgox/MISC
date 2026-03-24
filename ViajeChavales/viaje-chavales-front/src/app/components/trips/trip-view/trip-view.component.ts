import { DatePipe, DecimalPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { provideNativeDateAdapter } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ActivatedRoute } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import {
  AccommodationProposalObject,
  Comment,
  CreateProposalDto,
  Proposal,
  ProposalType,
  TransportProposalObject,
  Trip,
  TripRole,
  VisitProposalObject,
} from '../../../core/interfaces/trips.interface';
import { UserProfile } from '../../../core/interfaces/user.interface';
import { TripsService } from '../../../core/services/trips.service';
import { UsersService } from '../../../core/services/users.service';

type AccommodationDraft = {
  name: string;
  place: string;
  nights: number;
  priceEuro: number | null;
  referenceLink: string;
  details: string;
};

type TransportDraft = {
  name: string;
  origin: string;
  destination: string;
  priceEuro: number | null;
  referenceLink: string;
  details: string;
};

type VisitDraft = {
  name: string;
  category: string;
  scheduledAt: string;
  durationMinutes: number;
  priceEuro: number | null;
  referenceLink: string;
  details: string;
};

@Component({
  selector: 'app-trip-view',
  standalone: true,
  imports: [
    DatePipe,
    DecimalPipe,
    MatProgressSpinnerModule,
    MatDatepickerModule,
    MatFormFieldModule,
    MatInputModule,
    FormsModule,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [provideNativeDateAdapter()],
  templateUrl: './trip-view.component.html',
  styleUrl: './trip-view.component.css'
})
export class TripViewComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private usersService = inject(UsersService);
  private tripsService = inject(TripsService);
  private toastr = inject(ToastrService);
  private tripGroupId: string | null = null;

  readonly loading = signal(true);
  readonly tripState = signal<Trip | null>(null);
  readonly currentUser = signal<UserProfile | null>(null);

  readonly isPlanner = computed(
    () => this.tripState()?.plannerUsername === this.currentUser()?.username,
  );
  readonly isJoined = computed(() => {
    const username = this.currentUser()?.username;
    return (
      !!username &&
      !!this.tripState()?.participants.some((participant) => participant.userId === username)
    );
  });
  readonly canComment = computed(() => {
    const user = this.currentUser();
    const trip = this.tripState();

    if (!user || !trip || trip.status !== 'Planning' || user.userRole === 'Pending') {
      return false;
    }

    return this.isPlanner() || this.isJoined();
  });

  /** Misma regla que el backend para votar en proposals (planner o participante, no Pending). */
  readonly canVoteOnProposals = computed(() => {
    const user = this.currentUser();
    const trip = this.tripState();

    if (!user || !trip || trip.status !== 'Planning' || user.userRole === 'Pending') {
      return false;
    }

    return this.isPlanner() || this.isJoined();
  });
  readonly canCloseTrip = computed(() => {
    const trip = this.tripState();
    return !!trip && this.isPlanner() && trip.status === 'Planning' && trip.canBeClosed;
  });
  readonly availableProposalTypes = computed(() => this.getAvailableProposalTypes());

  readonly accommodationProposals = computed(() =>
    this.tripState()?.proposals.filter((proposal) => proposal.type === 'Accommodation') ?? [],
  );
  readonly transportProposals = computed(() =>
    this.tripState()?.proposals.filter((proposal) => proposal.type === 'Transport') ?? [],
  );
  readonly visitProposals = computed(() =>
    this.tripState()?.proposals.filter((proposal) => proposal.type === 'Visit') ?? [],
  );

  onEdit = false;
  comment = '';

  editTrip = {
    name: '',
    destination: '',
    details: '',
    budgetEuro: null as number | null,
    startDate: null as Date | null,
    endDate: null as Date | null,
  };

  proposalType: ProposalType = 'Accommodation';
  proposalDetails = '';
  accommodationDrafts: AccommodationDraft[] = [this.createAccommodationDraft()];
  transportDrafts: TransportDraft[] = [this.createTransportDraft()];
  visitDrafts: VisitDraft[] = [this.createVisitDraft()];
  roleSelections: Record<string, TripRole> = {};

  async ngOnInit(): Promise<void> {
    const id = Number(this.route.snapshot.params['id']);
    await this.reloadTrip(id);
  }

  private async reloadTrip(id: number) {
    this.loading.set(true);
    try {
      const requestedGroupId = this.route.snapshot.queryParamMap.get('groupId') ?? undefined;
      const trip = await this.tripsService.getById(id, requestedGroupId);
      this.tripGroupId = trip.groupId;
      const currentUser = await this.usersService.getCurrentUser(this.tripGroupId);
      this.currentUser.set(currentUser);
      this.applyTrip(trip);
    } catch (error: any) {
      this.toastr.error(error?.error?.message ?? 'No se pudo cargar el trip');
    } finally {
      this.loading.set(false);
    }
  }

  private applyTrip(trip: Trip) {
    const normalized: Trip = {
      ...trip,
      proposals: (trip.proposals ?? []).map((p) => ({
        ...p,
        votes: p.votes ?? [],
      })),
      comments: trip.comments ?? [],
    };
    this.tripState.set(normalized);
    this.editTrip = {
      name: normalized.name,
      destination: normalized.destination,
      details: normalized.details ?? '',
      budgetEuro: normalized.budget ? normalized.budget / 100 : null,
      startDate: new Date(normalized.startDate),
      endDate: new Date(normalized.endDate),
    };

    const availableTypes = this.availableProposalTypes();
    if (availableTypes.length > 0 && !availableTypes.includes(this.proposalType)) {
      this.proposalType = availableTypes[0];
    }
  }

  private getGroupContextId(): string | null {
    return this.tripGroupId ?? this.tripState()?.groupId ?? null;
  }

  private createAccommodationDraft(): AccommodationDraft {
    return {
      name: '',
      place: '',
      nights: 1,
      priceEuro: null,
      referenceLink: '',
      details: '',
    };
  }

  private createTransportDraft(): TransportDraft {
    return {
      name: '',
      origin: '',
      destination: '',
      priceEuro: null,
      referenceLink: '',
      details: '',
    };
  }

  private createVisitDraft(): VisitDraft {
    return {
      name: '',
      category: '',
      scheduledAt: '',
      durationMinutes: 60,
      priceEuro: null,
      referenceLink: '',
      details: '',
    };
  }

  get currentUsername() {
    return this.currentUser()?.username ?? '';
  }

  get canCreateProposal() {
    const trip = this.tripState();
    const user = this.currentUser();

    if (!trip || !user || trip.status !== 'Planning' || user.userRole === 'Pending') {
      return false;
    }

    if (this.isPlanner()) {
      return true;
    }

    if (!this.isJoined()) {
      return false;
    }

    return this.availableProposalTypes().includes(this.proposalType);
  }

  getAvailableProposalTypes(): ProposalType[] {
    const trip = this.tripState();
    if (!trip) {
      return [];
    }

    if (this.isPlanner()) {
      return ['Accommodation', 'Transport', 'Visit'];
    }

    const userRoles = trip.tripRoles
      .filter((assignment) => assignment.userId === this.currentUsername)
      .map((assignment) => assignment.role);

    const types: ProposalType[] = [];
    if (userRoles.includes('Accommodation')) {
      types.push('Accommodation');
    }
    if (userRoles.includes('Transport')) {
      types.push('Transport');
    }
    if (userRoles.includes('Visits')) {
      types.push('Visit');
    }
    return types;
  }

  getMemberRoles(userId: string) {
    return this.tripState()?.tripRoles.filter((assignment) => assignment.userId === userId) ?? [];
  }

  hasVoted(proposal: Proposal) {
    const votes = proposal.votes ?? [];
    return votes.some((vote) => vote.userId === this.currentUsername);
  }

  getProposalItems(proposal: Proposal) {
    if (proposal.type === 'Accommodation') {
      return proposal.accommodationItems;
    }
    if (proposal.type === 'Transport') {
      return proposal.transportItems;
    }
    return proposal.visitItems;
  }

  getAcceptedProposal(type: ProposalType) {
    if (type === 'Accommodation') {
      return this.tripState()?.acceptedAccommodationProposal;
    }
    if (type === 'Transport') {
      return this.tripState()?.acceptedTransportProposal;
    }
    return this.tripState()?.acceptedVisitProposal;
  }

  addAccommodationDraft() {
    this.accommodationDrafts = [...this.accommodationDrafts, this.createAccommodationDraft()];
  }

  addTransportDraft() {
    this.transportDrafts = [...this.transportDrafts, this.createTransportDraft()];
  }

  addVisitDraft() {
    this.visitDrafts = [...this.visitDrafts, this.createVisitDraft()];
  }

  removeAccommodationDraft(index: number) {
    this.accommodationDrafts = this.accommodationDrafts.filter((_, currentIndex) => currentIndex !== index);
  }

  removeTransportDraft(index: number) {
    this.transportDrafts = this.transportDrafts.filter((_, currentIndex) => currentIndex !== index);
  }

  removeVisitDraft(index: number) {
    this.visitDrafts = this.visitDrafts.filter((_, currentIndex) => currentIndex !== index);
  }

  async joinTrip() {
    const trip = this.tripState();
    if (!trip) {
      return;
    }

    try {
      const groupId = this.getGroupContextId();
      if (!groupId) {
        this.toastr.error('No se pudo resolver el grupo del trip');
        return;
      }

      this.applyTrip(await this.tripsService.joinTrip(trip.id, this.currentUsername, groupId));
      this.toastr.success('Te has unido al trip');
    } catch (error: any) {
      this.toastr.error(error?.error?.message ?? 'No se pudo unir al trip');
    }
  }

  async leaveTrip() {
    const trip = this.tripState();
    if (!trip) {
      return;
    }

    try {
      const groupId = this.getGroupContextId();
      if (!groupId) {
        this.toastr.error('No se pudo resolver el grupo del trip');
        return;
      }

      this.applyTrip(await this.tripsService.leaveTrip(trip.id, this.currentUsername, groupId));
      this.toastr.success('Has salido del trip');
    } catch (error: any) {
      this.toastr.error(error?.error?.message ?? 'No se pudo salir del trip');
    }
  }

  async updateTrip() {
    const trip = this.tripState();
    if (!trip || !this.editTrip.startDate || !this.editTrip.endDate) {
      return;
    }

    try {
      const groupId = this.getGroupContextId();
      if (!groupId) {
        this.toastr.error('No se pudo resolver el grupo del trip');
        return;
      }

      this.applyTrip(
        await this.tripsService.updateTrip(trip.id, {
          destination: this.editTrip.destination.trim(),
          name: this.editTrip.name.trim(),
          details: this.editTrip.details.trim() || undefined,
          budget: this.editTrip.budgetEuro ? Math.round(this.editTrip.budgetEuro * 100) : undefined,
          startDate: this.editTrip.startDate,
          endDate: this.editTrip.endDate,
        }, groupId),
      );
      this.onEdit = false;
      this.toastr.success('Trip actualizado');
    } catch (error: any) {
      this.toastr.error(error?.error?.message ?? 'No se pudo actualizar el trip');
    }
  }

  async setTripStatus(status: 'Closed' | 'Discarded') {
    const trip = this.tripState();
    if (!trip) {
      return;
    }

    try {
      const groupId = this.getGroupContextId();
      if (!groupId) {
        this.toastr.error('No se pudo resolver el grupo del trip');
        return;
      }

      this.applyTrip(await this.tripsService.updateTripStatus(trip.id, status, groupId));
      this.toastr.success(status === 'Closed' ? 'Trip cerrado' : 'Trip descartado');
    } catch (error: any) {
      this.toastr.error(error?.error?.message ?? 'No se pudo cambiar el estado del trip');
    }
  }

  async assignRole(userId: string) {
    const trip = this.tripState();
    const role = this.roleSelections[userId];
    if (!trip || !role) {
      return;
    }

    try {
      const groupId = this.getGroupContextId();
      if (!groupId) {
        this.toastr.error('No se pudo resolver el grupo del trip');
        return;
      }

      this.applyTrip(await this.tripsService.assignTripRole(trip.id, userId, role, groupId));
      this.toastr.success('Rol asignado');
    } catch (error: any) {
      this.toastr.error(error?.error?.message ?? 'No se pudo asignar el rol');
    }
  }

  async removeRole(userId: string, role: TripRole) {
    const trip = this.tripState();
    if (!trip) {
      return;
    }

    try {
      const groupId = this.getGroupContextId();
      if (!groupId) {
        this.toastr.error('No se pudo resolver el grupo del trip');
        return;
      }

      this.applyTrip(await this.tripsService.removeTripRole(trip.id, userId, role, groupId));
      this.toastr.success('Rol retirado');
    } catch (error: any) {
      this.toastr.error(error?.error?.message ?? 'No se pudo retirar el rol');
    }
  }

  private buildAccommodationItems(): AccommodationProposalObject[] {
    return this.accommodationDrafts.map((item) => ({
      name: item.name.trim(),
      place: item.place.trim(),
      nights: item.nights,
      pricePerPersonCents: Math.round((item.priceEuro ?? 0) * 100),
      referenceLink: item.referenceLink.trim() || undefined,
      details: item.details.trim() || undefined,
    }));
  }

  private buildTransportItems(): TransportProposalObject[] {
    return this.transportDrafts.map((item) => ({
      name: item.name.trim(),
      origin: item.origin.trim(),
      destination: item.destination.trim(),
      pricePerPersonCents: Math.round((item.priceEuro ?? 0) * 100),
      referenceLink: item.referenceLink.trim() || undefined,
      details: item.details.trim() || undefined,
    }));
  }

  private buildVisitItems(): VisitProposalObject[] {
    return this.visitDrafts.map((item) => ({
      name: item.name.trim(),
      category: item.category.trim(),
      scheduledAt: item.scheduledAt,
      durationMinutes: item.durationMinutes,
      pricePerPersonCents: Math.round((item.priceEuro ?? 0) * 100),
      referenceLink: item.referenceLink.trim() || undefined,
      details: item.details.trim() || undefined,
    }));
  }

  private resetProposalForm() {
    this.proposalDetails = '';
    this.accommodationDrafts = [this.createAccommodationDraft()];
    this.transportDrafts = [this.createTransportDraft()];
    this.visitDrafts = [this.createVisitDraft()];
  }

  async createProposal() {
    const trip = this.tripState();
    if (!trip) {
      return;
    }

    const payload: CreateProposalDto = {
      type: this.proposalType,
      details: this.proposalDetails.trim() || undefined,
    };

    if (this.proposalType === 'Accommodation') {
      payload.accommodationItems = this.buildAccommodationItems();
    } else if (this.proposalType === 'Transport') {
      payload.transportItems = this.buildTransportItems();
    } else {
      payload.visitItems = this.buildVisitItems();
    }

    try {
      const groupId = this.getGroupContextId();
      if (!groupId) {
        this.toastr.error('No se pudo resolver el grupo del trip');
        return;
      }

      this.applyTrip(await this.tripsService.createProposal(trip.id, payload, groupId));
      this.resetProposalForm();
      this.toastr.success('Proposal creada');
    } catch (error: any) {
      this.toastr.error(error?.error?.message ?? 'No se pudo crear la proposal');
    }
  }

  async deleteProposal(proposalId: number) {
    const trip = this.tripState();
    if (!trip) {
      return;
    }

    try {
      const groupId = this.getGroupContextId();
      if (!groupId) {
        this.toastr.error('No se pudo resolver el grupo del trip');
        return;
      }

      this.applyTrip(await this.tripsService.deleteProposal(trip.id, proposalId, groupId));
      this.toastr.success('Proposal eliminada');
    } catch (error: any) {
      this.toastr.error(error?.error?.message ?? 'No se pudo eliminar la proposal');
    }
  }

  async voteProposal(proposalId: number) {
    const trip = this.tripState();
    if (!trip) {
      return;
    }

    try {
      const groupId = this.getGroupContextId();
      if (!groupId) {
        this.toastr.error('No se pudo resolver el grupo del trip');
        return;
      }

      this.applyTrip(await this.tripsService.voteProposal(trip.id, proposalId, groupId));
      this.toastr.success('Voto registrado');
    } catch (error: any) {
      this.toastr.error(error?.error?.message ?? 'No se pudo votar la proposal');
    }
  }

  async unvoteProposal(proposalId: number) {
    const trip = this.tripState();
    if (!trip) {
      return;
    }

    try {
      const groupId = this.getGroupContextId();
      if (!groupId) {
        this.toastr.error('No se pudo resolver el grupo del trip');
        return;
      }

      this.applyTrip(await this.tripsService.unvoteProposal(trip.id, proposalId, groupId));
      this.toastr.success('Voto retirado');
    } catch (error: any) {
      this.toastr.error(error?.error?.message ?? 'No se pudo quitar el voto');
    }
  }

  async acceptProposal(proposalId: number) {
    const trip = this.tripState();
    if (!trip) {
      return;
    }

    try {
      const groupId = this.getGroupContextId();
      if (!groupId) {
        this.toastr.error('No se pudo resolver el grupo del trip');
        return;
      }

      this.applyTrip(await this.tripsService.updateProposalStatus(trip.id, proposalId, 'Accepted', groupId));
      this.toastr.success('Proposal aceptada');
    } catch (error: any) {
      this.toastr.error(error?.error?.message ?? 'No se pudo aceptar la proposal');
    }
  }

  async rollbackProposal(proposalId: number) {
    const trip = this.tripState();
    if (!trip) {
      return;
    }

    try {
      const groupId = this.getGroupContextId();
      if (!groupId) {
        this.toastr.error('No se pudo resolver el grupo del trip');
        return;
      }
      this.applyTrip(await this.tripsService.updateProposalStatus(trip.id, proposalId, 'Proposed', groupId));
      this.toastr.success('Se ha reabierto la votación');
    } catch (error: any) {
      this.toastr.error(error?.error?.message ?? 'No se pudo reabrir la proposal');
    }
  }

  async addComment() {
    const trip = this.tripState();
    if (!trip || this.comment.trim() === '') {
      return;
    }

    try {
      const groupId = this.getGroupContextId();
      if (!groupId) {
        this.toastr.error('No se pudo resolver el grupo del trip');
        return;
      }

      const newComment = await this.tripsService.addComment({
        userId: this.currentUsername,
        tripId: trip.id,
        comment: this.comment.trim(),
      }, groupId);
      this.tripState.set({
        ...trip,
        comments: [...trip.comments, newComment],
      });
      this.comment = '';
      this.toastr.success('Comentario añadido');
    } catch (error: any) {
      this.toastr.error(error?.error?.message ?? 'No se pudo comentar');
    }
  }

  async deleteComment(commentId: number) {
    const trip = this.tripState();
    if (!trip) {
      return;
    }

    try {
      const groupId = this.getGroupContextId();
      if (!groupId) {
        this.toastr.error('No se pudo resolver el grupo del trip');
        return;
      }

      await this.tripsService.deleteComment(commentId, groupId);
      this.tripState.set({
        ...trip,
        comments: trip.comments.filter((comment) => comment.id !== commentId),
      });
      this.toastr.success('Comentario eliminado');
    } catch (error: any) {
      this.toastr.error(error?.error?.message ?? 'No se pudo eliminar el comentario');
    }
  }
}
