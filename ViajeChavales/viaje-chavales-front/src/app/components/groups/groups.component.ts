import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Component, computed, inject, OnInit, PLATFORM_ID, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { Router } from '@angular/router';
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
  membersCount: number;
  adminsCount: number;
  pendingCount: number;
  tripsCount: number;
  planningTripsCount: number;
  closedTripsCount: number;
  proposalCount: number;
  members: GroupInviteMember[];
};

@Component({
  selector: 'app-groups',
  standalone: true,
  imports: [CommonModule, FormsModule, MatFormFieldModule, MatInputModule],
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
  private readonly router = inject(Router);

  readonly loading = signal(true);
  readonly cards = signal<GroupDashboardCard[]>([]);
  readonly showEmptyState = computed(() => !this.loading() && this.cards().length === 0);

  createGroupOpen = false;
  creatingGroup = false;
  newGroupName = '';
  origin = '';

  async ngOnInit(): Promise<void> {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    this.origin = window.location.origin;
    await this.loadDashboard();
  }

  get currentUsername() {
    return this.usersService.getUsername();
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

      const groups = await this.usersService.getUserGroups();
      this.activeGroupService.setGroups(groups);

      this.toastr.success('Grupo creado');
      this.newGroupName = '';
      this.createGroupOpen = false;
      await this.loadDashboard();
    } catch (error: any) {
      this.toastr.error(error?.error?.message ?? 'No se pudo crear el grupo');
    } finally {
      this.creatingGroup = false;
    }
  }

  async validatePendingMember(groupId: string, username: string) {
    try {
      await this.usersService.updateUserRole(username, 'Tripper', groupId);
      this.toastr.success('Usuario validado');
      await this.loadDashboard();
    } catch (error: any) {
      this.toastr.error(error?.error?.message ?? 'No se pudo validar al usuario');
    }
  }

  async rejectPendingMember(groupId: string, username: string) {
    try {
      await this.usersService.removeUser(username, groupId);
      this.toastr.success('Solicitud rechazada');
      await this.loadDashboard();
    } catch (error: any) {
      this.toastr.error(error?.error?.message ?? 'No se pudo rechazar la solicitud');
    }
  }

  async dissolveGroup(groupId: string, groupName: string) {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    const ok = window.confirm(
      `¿Disolver el grupo "${groupName}"? Se eliminarán viajes, chat y datos del grupo. Esta acción no se puede deshacer.`,
    );
    if (!ok) {
      return;
    }

    try {
      await this.groupsService.dissolveGroup(groupId);
      this.toastr.success('Grupo disuelto');
      const groups = await this.usersService.getUserGroups();
      this.activeGroupService.setGroups(groups);
      if (groups.length === 0) {
        await this.router.navigate(['/home']);
      }
      await this.loadDashboard();
    } catch (error: any) {
      this.toastr.error(error?.error?.message ?? 'No se pudo disolver el grupo');
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
          title: `Invitación a ${groupName}`,
          text: 'Únete a mi grupo en ViajeChavales',
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
        this.toastr.info('Enlace de invitación copiado');
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

      const cardResults = await Promise.allSettled(
        memberships.map((membership) => this.buildGroupCard(membership)),
      );

      const cards = cardResults.map((result, index) => {
        if (result.status === 'fulfilled') {
          return result.value;
        }

        const membership = memberships[index];
        return {
          groupId: membership.groupId,
          groupName: membership.groupName,
          userRole: membership.userRole,
          membersCount: 0,
          adminsCount: 0,
          pendingCount: 0,
          tripsCount: 0,
          planningTripsCount: 0,
          closedTripsCount: 0,
          proposalCount: 0,
          members: [],
        } as GroupDashboardCard;
      });

      this.cards.set(cards);

      if (cardResults.some((result) => result.status === 'rejected')) {
        this.toastr.warning('Algunos grupos no se pudieron cargar por completo');
      }
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
      membersCount: members.length,
      adminsCount: members.filter((member) => member.userRole === 'Admin').length,
      pendingCount: members.filter((member) => member.userRole === 'Pending').length,
      tripsCount: trips.length,
      planningTripsCount: planningTrips,
      closedTripsCount: closedTrips,
      proposalCount,
      members,
    };
  }

}
