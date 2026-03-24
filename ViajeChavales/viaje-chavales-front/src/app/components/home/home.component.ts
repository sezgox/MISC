import { isPlatformBrowser } from '@angular/common';
import { Component, computed, inject, OnDestroy, OnInit, PLATFORM_ID, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { ToastrService } from 'ngx-toastr';
import { Subscription } from 'rxjs';
import { Freedays } from '../../core/interfaces/freedays.interface';
import { Trip } from '../../core/interfaces/trips.interface';
import { UserProfile } from '../../core/interfaces/user.interface';
import { ActiveGroupService } from '../../core/services/active-group.service';
import { FreedaysService } from '../../core/services/freedays.service';
import { TripsService } from '../../core/services/trips.service';
import { UsersService } from '../../core/services/users.service';
import { GraphComponent } from '../shared/graph/graph.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [FormsModule, MatSelectModule, MatFormFieldModule, GraphComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css',
})
export class HomeComponent implements OnInit, OnDestroy {
  private readonly freedaysService = inject(FreedaysService);
  private readonly usersService = inject(UsersService);
  private readonly tripsService = inject(TripsService);
  readonly activeGroupService = inject(ActiveGroupService);
  private readonly router = inject(Router);
  private readonly toastr = inject(ToastrService);
  private readonly platformId = inject(PLATFORM_ID);
  private groupChangedSub: Subscription | null = null;

  readonly allGroupsFilterValue = '__all__';
  readonly currentUser = signal<UserProfile | null>(null);
  readonly freedays = signal<Freedays[]>([]);
  readonly trips = signal<Trip[]>([]);
  readonly loading = signal(true);

  showTrips = false;
  selectedAvailabilityGroup = '';

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

  readonly isAllGroupsFilter = computed(
    () => this.selectedAvailabilityGroup === this.allGroupsFilterValue,
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
    this.initializeGroupFilter();

    this.groupChangedSub = this.activeGroupService.changed$.subscribe(async () => {
      await this.syncGroupContext();
      this.ensureSelectedGroupExists();
      await this.refreshDashboard();
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
      this.ensureSelectedGroupExists();

      const groupIds = this.resolveFilteredGroupIds();
      if (groupIds.length === 0) {
        this.currentUser.set(null);
        this.freedays.set([]);
        this.trips.set([]);
        return;
      }

      if (this.isAllGroupsFilter()) {
        this.currentUser.set(null);
      } else {
        const selectedGroupId = groupIds[0];
        const currentUser = await this.usersService.getCurrentUser(selectedGroupId);
        this.currentUser.set(currentUser);
      }

      const [freedaysByGroup, tripsByGroup] = await Promise.all([
        Promise.all(groupIds.map((groupId) => this.freedaysService.getFreedays(undefined, groupId))),
        Promise.all(groupIds.map((groupId) => this.tripsService.getTrips(groupId))),
      ]);

      const mergedFreedays = freedaysByGroup.flat();
      const mergedTrips = tripsByGroup.flat();

      this.applyFreedayFilter(mergedFreedays);
      this.trips.set(mergedTrips);
    } catch (error: any) {
      this.toastr.error(error?.error?.message ?? 'No se pudo cargar el panel');
    } finally {
      this.loading.set(false);
    }
  }

  async onFilterChange(): Promise<void> {
    await this.refreshDashboard();
  }

  toggleTripsOverlay(): void {}

  goToGroups() {
    this.router.navigate(['/groups']);
  }

  private initializeGroupFilter() {
    if (this.selectedAvailabilityGroup) {
      return;
    }

    this.selectedAvailabilityGroup = this.allGroupsFilterValue;
  }

  private ensureSelectedGroupExists() {
    if (this.selectedAvailabilityGroup === this.allGroupsFilterValue) {
      return;
    }

    const exists = this.activeGroupService
      .groups()
      .some((group) => group.groupId === this.selectedAvailabilityGroup);
    if (exists) {
      return;
    }

    this.selectedAvailabilityGroup = this.allGroupsFilterValue;
  }

  private resolveFilteredGroupIds(): string[] {
    if (this.selectedAvailabilityGroup === this.allGroupsFilterValue) {
      return this.activeGroupService.groups().map((group) => group.groupId);
    }

    return this.selectedAvailabilityGroup ? [this.selectedAvailabilityGroup] : [];
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

  private async syncGroupContext() {
    try {
      const groups = await this.usersService.getUserGroups();
      this.activeGroupService.setGroups(groups);
    } catch {
      // Keep current context on transient failures
    }
  }

  private capitalize(value: string) {
    return value.charAt(0).toUpperCase() + value.slice(1);
  }
}
