import { ChangeDetectionStrategy, Component, computed, inject, OnInit, signal } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { provideNativeDateAdapter } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { ToastrService } from 'ngx-toastr';
import { CreateTripDto, Trip } from '../../core/interfaces/trips.interface';
import { UserProfile } from '../../core/interfaces/user.interface';
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
    TripCardComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [provideNativeDateAdapter()],
  templateUrl: './trips.component.html',
  styleUrl: './trips.component.css'
})
export class TripsComponent implements OnInit {
  private tripsService = inject(TripsService);
  private usersService = inject(UsersService);
  private toastr = inject(ToastrService);

  readonly trips = signal<Trip[]>([]);
  readonly currentUser = signal<UserProfile | null>(null);

  readonly myTrips = computed(() =>
    this.trips().filter((trip) => trip.plannerUsername === this.usersService.getUsername()),
  );
  readonly otherTrips = computed(() =>
    this.trips().filter((trip) => trip.plannerUsername !== this.usersService.getUsername()),
  );

  range = new FormGroup({
    start: new FormControl<Date | null>(new Date(), [Validators.required]),
    end: new FormControl<Date | null>(new Date(), [Validators.required]),
  });

  tripName = '';
  destination = '';
  budgetEuro: number | null = null;
  details = '';

  async ngOnInit(): Promise<void> {
    try {
      const [user, trips] = await Promise.all([
        this.usersService.getCurrentUser(),
        this.tripsService.getTrips(),
      ]);
      this.currentUser.set(user);
      this.trips.set(trips);
    } catch (error: any) {
      this.toastr.error(error?.error?.message ?? 'No se pudieron cargar los viajes');
    }
  }

  async addTrip() {
    if (this.currentUser()?.userRole === 'Pending') {
      this.toastr.warning('Necesitas validación de un admin para crear viajes');
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

    const trip: CreateTripDto = {
      name: this.tripName.trim(),
      destination: this.destination.trim(),
      startDate,
      endDate,
      details: this.details.trim() || undefined,
      budget: this.budgetEuro ? Math.round(this.budgetEuro * 100) : undefined,
    };

    try {
      const createdTrip = await this.tripsService.addTrip(trip);
      this.trips.set([createdTrip, ...this.trips()]);
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
    try {
      await this.tripsService.removeTrip(tripId);
      this.trips.set(this.trips().filter((trip) => trip.id !== tripId));
      this.toastr.success('Viaje eliminado');
    } catch (error: any) {
      this.toastr.error(error?.error?.message ?? 'No se pudo eliminar el viaje');
    }
  }
}
