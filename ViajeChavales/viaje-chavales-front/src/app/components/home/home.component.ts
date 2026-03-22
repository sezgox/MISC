import { Component, computed, inject, OnDestroy, OnInit, PLATFORM_ID, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { isPlatformBrowser } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { ToastrService } from 'ngx-toastr';
import { Subscription } from 'rxjs';
import { Freedays } from '../../core/interfaces/freedays.interface';
import { Trip } from '../../core/interfaces/trips.interface';
import { UserProfile } from '../../core/interfaces/user.interface';
import { ActiveGroupService } from '../../core/services/active-group.service';
import { FreedaysService } from '../../core/services/freedays.service';
import { GroupsService } from '../../core/services/groups.service';
import { TripsService } from '../../core/services/trips.service';
import { UsersService } from '../../core/services/users.service';
import { GraphComponent } from '../shared/graph/graph.component';
import { InviteComponent } from '../shared/invite/invite.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [FormsModule, MatSelectModule, MatFormFieldModule, InviteComponent, GraphComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css',
})
export class HomeComponent implements OnInit, OnDestroy {
  private freedaysService = inject(FreedaysService);
  private usersService = inject(UsersService);
  private groupsService = inject(GroupsService);
  private tripsService = inject(TripsService);
  readonly activeGroupService = inject(ActiveGroupService);
  private toastr = inject(ToastrService);
  private platformId = inject(PLATFORM_ID);
  private groupChangedSub: Subscription | null = null;

  readonly currentUser = signal<UserProfile | null>(null);
  readonly groupMembers = signal<UserProfile[]>([]);
  readonly freedays = signal<Freedays[]>([]);
  readonly trips = signal<Trip[]>([]);
  readonly loading = signal(true);

  showTrips = false;
  selectedGroupId = '';
  createGroupOpen = false;
  newGroupName = '';
  creatingGroup = false;

  currentDate = new Date();
  currentYear = this.currentDate.getFullYear();
  currentMonth = this.currentDate.getMonth();
  selectedYear = this.currentYear;
  selectedMonth = this.currentMonth;
  selectedMonthSpan = 1;
  yearOptions = [this.currentYear, this.currentYear + 1];
  monthSpanOptions = [
    { value: 1, label: '1 mes' },
    { value: 2, label: '2 meses' },
  ];
  monthOptions = [
    { value: 0, label: 'Enero' },
    { value: 1, label: 'Febrero' },
    { value: 2, label: 'Marzo' },
    { value: 3, label: 'Abril' },
    { value: 4, label: 'Mayo' },
    { value: 5, label: 'Junio' },
    { value: 6, label: 'Julio' },
    { value: 7, label: 'Agosto' },
    { value: 8, label: 'Septiembre' },
    { value: 9, label: 'Octubre' },
    { value: 10, label: 'Noviembre' },
    { value: 11, label: 'Diciembre' },
  ];

  readonly isAdmin = computed(() => this.currentUser()?.userRole === 'Admin');
  readonly pendingMembers = computed(() =>
    (Array.isArray(this.groupMembers()) ? this.groupMembers() : []).filter(
      (member) => member.userRole === 'Pending',
    ),
  );
  readonly adminCount = computed(() =>
    (Array.isArray(this.groupMembers()) ? this.groupMembers() : []).filter(
      (member) => member.userRole === 'Admin',
    ).length,
  );
  readonly groupMembersPreview = computed(() =>
    (Array.isArray(this.groupMembers()) ? this.groupMembers() : []).slice(0, 8),
  );
  readonly remainingMembersCount = computed(() =>
    Math.max((this.groupMembers()?.length ?? 0) - this.groupMembersPreview().length, 0),
  );

  get selectedMonthLabel() {
    return this.monthOptions.find((month) => month.value === this.selectedMonth)?.label ?? '';
  }

  get selectedRangeLabel() {
    const start = new Date(this.selectedYear, this.selectedMonth, 1);
    const end = new Date(this.selectedYear, this.selectedMonth + this.selectedMonthSpan - 1, 1);
    const sameYear = start.getFullYear() === end.getFullYear();

    if (this.selectedMonthSpan === 1) {
      return `${this.selectedMonthLabel} ${this.selectedYear}`;
    }

    const startLabel = start.toLocaleDateString('es-ES', {
      month: 'long',
      ...(sameYear ? {} : { year: 'numeric' }),
    });
    const endLabel = end.toLocaleDateString('es-ES', {
      month: 'long',
      year: 'numeric',
    });

    return `${this.capitalize(startLabel)} - ${this.capitalize(endLabel)}`;
  }

  async ngOnInit(): Promise<void> {
    if (!isPlatformBrowser(this.platformId)) {
      this.loading.set(false);
      return;
    }

    await this.syncGroupContext();
    this.selectedGroupId = this.activeGroupService.getActiveGroupId() ?? '';

    this.groupChangedSub = this.activeGroupService.changed$.subscribe(() => {
      this.selectedGroupId = this.activeGroupService.getActiveGroupId() ?? '';
      this.refreshDashboard();
    });

    await this.refreshDashboard();
  }

  ngOnDestroy(): void {
    this.groupChangedSub?.unsubscribe();
  }

  async refreshDashboard(): Promise<void> {
    this.loading.set(true);

    try {
      await this.syncGroupContext();
      this.selectedGroupId = this.activeGroupService.getActiveGroupId() ?? '';

      const [currentUser, groupMembers, allFreedays] = await Promise.all([
        this.usersService.getCurrentUser(),
        this.usersService.getUsers(),
        this.freedaysService.getFreedays(),
      ]);

      this.currentUser.set(currentUser);
      this.groupMembers.set(Array.isArray(groupMembers) ? groupMembers : []);
      this.applyFreedayFilter(allFreedays);
      await this.loadTrips();
    } catch (error: any) {
      this.toastr.error(error?.error?.message ?? 'No se pudo cargar el panel');
    } finally {
      this.loading.set(false);
    }
  }

  private getSelectedMonthRange() {
    return {
      start: new Date(this.selectedYear, this.selectedMonth, 1),
      end: new Date(this.selectedYear, this.selectedMonth + this.selectedMonthSpan, 0),
    };
  }

  private applyFreedayFilter(freedays: Freedays[]) {
    const selectedRange = this.getSelectedMonthRange();

    this.freedays.set(
      freedays.filter((item) => {
        const start = new Date(item.startDate);
        const end = new Date(item.endDate);
        return start <= selectedRange.end && end >= selectedRange.start;
      }),
    );
  }

  async onFilterChange(): Promise<void> {
    const allFreedays = await this.freedaysService.getFreedays();
    this.applyFreedayFilter(allFreedays);
  }

  async toggleTripsOverlay(): Promise<void> {
    await this.loadTrips();
  }

  async loadTrips(): Promise<void> {
    try {
      this.trips.set(await this.tripsService.getTrips());
    } catch (error: any) {
      this.toastr.error(error?.error?.message ?? 'No se pudieron cargar los viajes');
      this.showTrips = false;
    }
  }

  async setRole(username: string, role: 'Tripper' | 'Admin') {
    try {
      await this.usersService.updateUserRole(username, role);
      await this.refreshDashboard();
      this.toastr.success(
        role === 'Tripper' ? 'Usuario validado como tripper' : 'Usuario ascendido a admin',
      );
    } catch (error: any) {
      this.toastr.error(error?.error?.message ?? 'No se pudo actualizar el rol');
    }
  }

  async removeUser(username: string) {
    try {
      await this.usersService.removeUser(username);
      await this.refreshDashboard();
      this.toastr.success('Usuario expulsado del grupo');
    } catch (error: any) {
      this.toastr.error(error?.error?.message ?? 'No se pudo expulsar al usuario');
    }
  }

  private capitalize(value: string) {
    return value.charAt(0).toUpperCase() + value.slice(1);
  }

  async changeGroupFromHome() {
    if (!this.selectedGroupId || this.selectedGroupId === this.activeGroupService.getActiveGroupId()) {
      return;
    }

    try {
      await this.usersService.setActiveGroup(this.selectedGroupId);
      this.activeGroupService.setActiveGroupById(this.selectedGroupId, true);
      this.toastr.success('Grupo activo actualizado');
    } catch (error: any) {
      this.toastr.error(error?.error?.message ?? 'No se pudo cambiar de grupo');
      this.selectedGroupId = this.activeGroupService.getActiveGroupId() ?? '';
    }
  }

  toggleCreateGroup() {
    this.createGroupOpen = !this.createGroupOpen;
    if (!this.createGroupOpen) {
      this.newGroupName = '';
    }
  }

  async createGroupFromHome() {
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
      const group = await this.groupsService.createGroup(name);
      await this.usersService.joinGroup(group.id);
      await this.usersService.setActiveGroup(group.id);

      await this.syncGroupContext();
      this.activeGroupService.setActiveGroupById(group.id, true);
      this.selectedGroupId = group.id;
      this.createGroupOpen = false;
      this.newGroupName = '';
      this.toastr.success('Nuevo grupo creado y activado');
    } catch (error: any) {
      this.toastr.error(error?.error?.message ?? 'No se pudo crear el grupo');
    } finally {
      this.creatingGroup = false;
    }
  }

  private async syncGroupContext() {
    try {
      const groups = await this.usersService.getUserGroups();
      this.activeGroupService.setGroups(groups);
    } catch {
      // keep current active group state on transient failures
    }
  }
}
