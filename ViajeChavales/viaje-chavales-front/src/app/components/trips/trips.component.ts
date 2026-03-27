import { isPlatformBrowser } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  OnInit,
  PLATFORM_ID,
  signal,
} from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { provideNativeDateAdapter } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { ToastrService } from 'ngx-toastr';
import { CreateTripDto, Trip } from '../../core/interfaces/trips.interface';
import { UserGroupMembership, UserProfile } from '../../core/interfaces/user.interface';
import { TripsService } from '../../core/services/trips.service';
import { UsersService } from '../../core/services/users.service';
import { TripCardComponent } from './trip-card/trip-card.component';

@Component({
  selector: 'app-trips',
  standalone: true,
  imports: [
    MatFormFieldModule,
    MatDatepickerModule,
    FormsModule,
    ReactiveFormsModule,
    MatInputModule,
    MatSelectModule,
    TripCardComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [provideNativeDateAdapter()],
  templateUrl: './trips.component.html',
  styleUrl: './trips.component.css',
})
export class TripsComponent implements OnInit {
  private readonly tripsService = inject(TripsService);
  private readonly usersService = inject(UsersService);
  private readonly toastr = inject(ToastrService);
  private readonly platformId = inject(PLATFORM_ID);

  /** Todos los viajes de todos los grupos del usuario (deduplicados por id). */
  readonly allTrips = signal<Trip[]>([]);
  readonly currentUser = signal<UserProfile | null>(null);
  readonly groupMemberships = signal<UserGroupMembership[]>([]);

  /** `__all__` = sin filtro; si no, `groupId` del grupo elegido (signal para que `computed` reaccione). */
  readonly tripListFilterGroupId = signal<string>('__all__');

  readonly tripsForList = computed(() => {
    const list = this.allTrips();
    const filter = this.tripListFilterGroupId();
    if (filter === '__all__') {
      return list;
    }
    return list.filter((trip) => trip.groupId === filter);
  });

  readonly myTrips = computed(() =>
    this.tripsForList().filter((trip) => trip.plannerUsername === this.usersService.getUsername()),
  );
  readonly otherTrips = computed(() =>
    this.tripsForList().filter((trip) => trip.plannerUsername !== this.usersService.getUsername()),
  );

  readonly selectedGroup = computed(
    () => this.groupMemberships().find((membership) => membership.groupId === this.selectedGroupId) ?? null,
  );

  readonly currentSelectedGroupRole = computed(() => {
    const user = this.currentUser();
    if (user && user.groupId === this.selectedGroupId) {
      return user.userRole;
    }

    return this.selectedGroup()?.userRole ?? null;
  });

  range = new FormGroup({
    start: new FormControl<Date | null>(new Date(), [Validators.required]),
    end: new FormControl<Date | null>(new Date(), [Validators.required]),
  });

  selectedGroupId = '';
  tripName = '';
  destination = '';
  budgetEuro: number | null = null;
  details = '';

  async ngOnInit(): Promise<void> {
    await this.loadContextAndTrips();
  }

  onCreateGroupChange(groupId: string) {
    this.selectedGroupId = groupId;
    void this.refreshCurrentUserForSelectedGroup();
  }

  onTripListFilterChange(groupId: string) {
    this.tripListFilterGroupId.set(groupId);
  }

  async addTrip() {
    await this.refreshCurrentUserForSelectedGroup();

    if (this.currentSelectedGroupRole() === 'Pending') {
      this.toastr.warning('Necesitas validación de un admin para crear viajes en este grupo');
      return;
    }

    const startDate = this.range.value.start;
    const endDate = this.range.value.end;

    if (!startDate || !endDate || this.destination.trim() === '') {
      this.toastr.error('Completa nombre, destino y rango de fechas');
      return;
    }

    if (this.tripName.trim().length === 0 || this.tripName.trim().length > 20) {
      this.toastr.error('El nombre del trip debe tener entre 1 y 20 caracteres');
      return;
    }

    if (!this.selectedGroupId) {
      this.toastr.error('Selecciona un grupo para crear el trip');
      return;
    }

    const trip: CreateTripDto = {
      name: this.tripName.trim(),
      destination: this.destination.trim(),
      startDate,
      endDate,
      details: this.details.trim() || undefined,
      budget: this.budgetEuro ? Math.round(this.budgetEuro * 100) : undefined,
    };

    try {
      const createdTrip = await this.tripsService.addTrip(trip, this.selectedGroupId);
      this.allTrips.set([createdTrip, ...this.allTrips().filter((t) => t.id !== createdTrip.id)]);
      this.tripName = '';
      this.destination = '';
      this.budgetEuro = null;
      this.details = '';
      this.range.reset({
        start: new Date(),
        end: new Date(),
      });
      this.toastr.success('Viaje creado');
    } catch (error: any) {
      this.toastr.error(error?.error?.message ?? 'No se pudo crear el viaje');
    }
  }

  async deleteTrip(tripId: number) {
    const trip = this.allTrips().find((t) => t.id === tripId);
    if (!trip) {
      this.toastr.error('No se encontró el viaje');
      return;
    }

    if (isPlatformBrowser(this.platformId)) {
      const ok = window.confirm(
        `¿Eliminar definitivamente el trip "${trip.name}"? Esta acción no se puede deshacer.`,
      );
      if (!ok) {
        return;
      }
    }

    try {
      await this.tripsService.removeTrip(tripId, trip.groupId);
      this.allTrips.set(this.allTrips().filter((t) => t.id !== tripId));
      this.toastr.success('Viaje eliminado');
    } catch (error: any) {
      this.toastr.error(error?.error?.message ?? 'No se pudo eliminar el viaje');
    }
  }

  private updateTripInList(updatedTrip: Trip) {
    this.allTrips.set(this.allTrips().map((trip) => (trip.id === updatedTrip.id ? updatedTrip : trip)));
  }

  async discardTrip(tripId: number) {
    const trip = this.allTrips().find((t) => t.id === tripId);
    if (!trip) {
      this.toastr.error('No se encontró el viaje');
      return;
    }

    try {
      const updatedTrip = await this.tripsService.updateTripStatus(tripId, 'Discarded', trip.groupId);
      this.updateTripInList(updatedTrip);
      this.toastr.success('Viaje descartado');
    } catch (error: any) {
      this.toastr.error(error?.error?.message ?? 'No se pudo descartar el viaje');
    }
  }

  async reactivateTrip(tripId: number) {
    const trip = this.allTrips().find((t) => t.id === tripId);
    if (!trip) {
      this.toastr.error('No se encontró el viaje');
      return;
    }

    try {
      const updatedTrip = await this.tripsService.updateTripStatus(tripId, 'Planning', trip.groupId);
      this.updateTripInList(updatedTrip);
      this.toastr.success('Viaje reactivado');
    } catch (error: any) {
      this.toastr.error(error?.error?.message ?? 'No se pudo reactivar el viaje');
    }
  }

  private async loadContextAndTrips() {
    try {
      const memberships = await this.usersService.getUserGroups();
      this.groupMemberships.set(memberships);

      if (!memberships.length) {
        this.currentUser.set(null);
        this.allTrips.set([]);
        this.selectedGroupId = '';
        return;
      }

      if (!this.selectedGroupId || !memberships.some((membership) => membership.groupId === this.selectedGroupId)) {
        this.selectedGroupId = memberships[0].groupId;
      }

      await Promise.all([this.loadAllTrips(), this.refreshCurrentUserForSelectedGroup()]);
    } catch (error: any) {
      this.toastr.error(error?.error?.message ?? 'No se pudieron cargar los grupos');
    }
  }

  private async loadAllTrips() {
    const memberships = this.groupMemberships();
    if (!memberships.length) {
      this.allTrips.set([]);
      return;
    }

    try {
      const lists = await Promise.all(
        memberships.map((m) => this.tripsService.getTrips(m.groupId).catch(() => [] as Trip[])),
      );
      const byId = new Map<number, Trip>();
      for (const list of lists) {
        for (const trip of list) {
          byId.set(trip.id, trip);
        }
      }
      const merged = Array.from(byId.values()).sort(
        (a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime(),
      );
      this.allTrips.set(merged);
    } catch (error: any) {
      this.toastr.error(error?.error?.message ?? 'No se pudieron cargar los viajes');
    }
  }

  private async refreshCurrentUserForSelectedGroup() {
    if (!this.selectedGroupId) {
      this.currentUser.set(null);
      return;
    }

    try {
      const user = await this.usersService.getCurrentUser(this.selectedGroupId);
      this.currentUser.set(user);
    } catch {
      this.currentUser.set(null);
    }
  }
}
