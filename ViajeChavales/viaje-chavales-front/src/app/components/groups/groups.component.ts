import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Component, inject, OnInit, PLATFORM_ID, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { GroupInviteMember } from '../../core/interfaces/group.interface';
import { Trip } from '../../core/interfaces/trips.interface';
import { UserGroupMembership } from '../../core/interfaces/user.interface';
import { ActiveGroupService } from '../../core/services/active-group.service';
import { GroupsService } from '../../core/services/groups.service';
import { TripsService } from '../../core/services/trips.service';
import { UsersService } from '../../core/services/users.service';

type GroupDashboardCard = {
  groupId: string;
  groupName: string;
  userRole: string;
  isActive: boolean;
  membersCount: number;
  adminsCount: number;
  pendingCount: number;
  tripsCount: number;
  planningTripsCount: number;
  closedTripsCount: number;
  proposalCount: number;
  membersPreview: GroupInviteMember[];
};

@Component({
  selector: 'app-groups',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './groups.component.html',
  styleUrl: './groups.component.css',
})
export class GroupsComponent implements OnInit {
  private readonly usersService = inject(UsersService);
  private readonly groupsService = inject(GroupsService);
  private readonly tripsService = inject(TripsService);
  private readonly activeGroupService = inject(ActiveGroupService);
  private readonly toastr = inject(ToastrService);
  private readonly platformId = inject(PLATFORM_ID);

  readonly loading = signal(true);
  readonly cards = signal<GroupDashboardCard[]>([]);

  createGroupOpen = false;
  creatingGroup = false;
  newGroupName = '';
  origin = '';

  async ngOnInit(): Promise<void> {
    if (isPlatformBrowser(this.platformId)) {
      this.origin = window.location.origin;
    }

    await this.loadDashboard();
  }

  toggleCreateGroup() {
    this.createGroupOpen = !this.createGroupOpen;
    if (!this.createGroupOpen) {
      this.newGroupName = '';
    }
  }

  async createGroup() {
    const name = this.newGroupName.trim();
    if (!name || this.creatingGroup) {
      return;
    }

    if (name.length < 3) {
      this.toastr.error('El nombre del grupo debe tener al menos 3 caracteres');
      return;
    }

    this.creatingGroup = true;
    try {
      const createdGroup = await this.groupsService.createGroup(name);
      await this.usersService.joinGroup(createdGroup.id);
      await this.usersService.setActiveGroup(createdGroup.id);

      const groups = await this.usersService.getUserGroups();
      this.activeGroupService.setGroups(groups);
      this.activeGroupService.setActiveGroupById(createdGroup.id, true);

      this.toastr.success('Grupo creado y activado');
      this.newGroupName = '';
      this.createGroupOpen = false;
      await this.loadDashboard();
    } catch (error: any) {
      this.toastr.error(error?.error?.message ?? 'No se pudo crear el grupo');
    } finally {
      this.creatingGroup = false;
    }
  }

  async activateGroup(groupId: string) {
    if (!groupId || groupId === this.activeGroupService.getActiveGroupId()) {
      return;
    }

    try {
      await this.usersService.setActiveGroup(groupId);
      const groups = await this.usersService.getUserGroups();
      this.activeGroupService.setGroups(groups);
      this.cards.update((cards) => {
        const activeGroups = new Set(groups.filter((group) => group.isActive).map((group) => group.groupId));
        return cards.map((card) => ({
          ...card,
          isActive: activeGroups.has(card.groupId),
        }));
      });
      this.toastr.success('Grupo activo actualizado');
    } catch (error: any) {
      this.toastr.error(error?.error?.message ?? 'No se pudo activar el grupo');
    }
  }

  async shareGroup(groupId: string, groupName: string) {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    const link = `${this.origin}/join?group=${groupId}`;
    const isMobile = window.matchMedia('(pointer: coarse)').matches || window.innerWidth <= 768;

    if (isMobile && typeof navigator.share === 'function') {
      try {
        await navigator.share({
          title: `Invitacion a ${groupName}`,
          text: 'Unete a mi grupo en ViajeChavales',
          url: link,
        });
        return;
      } catch (error: any) {
        if (error?.name === 'AbortError') {
          return;
        }
      }
    }

    if (navigator.clipboard?.writeText) {
      try {
        await navigator.clipboard.writeText(link);
        this.toastr.info('Enlace de invitacion copiado');
        return;
      } catch {
        // continue to prompt fallback
      }
    }

    window.prompt('Copia este enlace manualmente:', link);
  }

  private async loadDashboard() {
    this.loading.set(true);

    try {
      const memberships = await this.usersService.getUserGroups();
      this.activeGroupService.setGroups(memberships);

      const cards = await Promise.all(memberships.map((membership) => this.buildGroupCard(membership)));
      this.cards.set(cards);
    } catch (error: any) {
      this.cards.set([]);
      this.toastr.error(error?.error?.message ?? 'No se pudieron cargar tus grupos');
    } finally {
      this.loading.set(false);
    }
  }

  private async buildGroupCard(membership: UserGroupMembership): Promise<GroupDashboardCard> {
    const [preview, trips] = await Promise.all([
      this.groupsService.getGroupInvitePreview(membership.groupId),
      this.tripsService.getTrips(membership.groupId).catch(() => [] as Trip[]),
    ]);

    const members = preview?.members ?? [];
    const planningTrips = trips.filter((trip) => trip.status === 'Planning').length;
    const closedTrips = trips.filter((trip) => trip.status === 'Closed').length;
    const proposalCount = trips.reduce((total, trip) => {
      const proposals = Array.isArray(trip.proposals) ? trip.proposals : [];
      return total + proposals.filter((proposal) => proposal.status === 'Proposed').length;
    }, 0);

    return {
      groupId: membership.groupId,
      groupName: membership.groupName,
      userRole: membership.userRole,
      isActive: membership.isActive,
      membersCount: members.length,
      adminsCount: members.filter((member) => member.userRole === 'Admin').length,
      pendingCount: members.filter((member) => member.userRole === 'Pending').length,
      tripsCount: trips.length,
      planningTripsCount: planningTrips,
      closedTripsCount: closedTrips,
      proposalCount,
      membersPreview: members.slice(0, 5),
    };
  }
}
