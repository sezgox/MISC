import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, OnInit, signal, WritableSignal } from '@angular/core';
import { provideNativeDateAdapter } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ActivatedRoute } from '@angular/router';
import { Trip } from '../../../core/interfaces/trips.interface';
import { TripsService } from '../../../core/services/trips.service';
import { NavbarComponent } from '../../navbar/navbar.component';
import { UsersService } from './../../../core/services/users.service';

@Component({
  selector: 'app-trip-view',
  standalone: true,
  imports: [DatePipe, NavbarComponent, MatProgressSpinnerModule, MatDatepickerModule, MatFormFieldModule, MatInputModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [provideNativeDateAdapter()],
  templateUrl: './trip-view.component.html',
  styleUrl: './trip-view.component.css'
})
export class TripViewComponent implements OnInit{


  route = inject(ActivatedRoute);
  usersService = inject(UsersService);
  tripsService =  inject(TripsService);

  loading: WritableSignal<boolean> = signal(true);
  trip: Trip | null = null;
  isOwner: boolean = false;
  onEdit: boolean = false;

  previousStart: Date | null = null;
  previousEnd: Date | null = null;

  async ngOnInit(): Promise<void> {
    const id = this.route.snapshot.params['id'];
    await this.getTrip(id)
    this.isOwner = this.usersService.getUsername() == this.trip?.userId;
    console.log(this.isOwner)
  }

  async getTrip(id: any){
    await this.tripsService.getById(id).then(res => {
      this.trip = res;
      this.loading.set(false);
      this.previousStart = this.trip?.startDate ?? null;
      this.previousEnd = this.trip?.endDate ?? null;
    })
    console.log();
  }

}
