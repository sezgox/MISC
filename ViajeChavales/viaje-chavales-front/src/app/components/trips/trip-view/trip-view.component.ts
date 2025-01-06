import { DatePipe } from '@angular/common';
import { Component, inject, OnInit, signal, WritableSignal } from '@angular/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ActivatedRoute } from '@angular/router';
import { Trip } from '../../../core/interfaces/trips.interface';
import { HighlightDatePipe } from '../../../core/pipes/highlightDate.pipe';
import { TripsService } from '../../../core/services/trips.service';
import { NavbarComponent } from '../../navbar/navbar.component';

@Component({
  selector: 'app-trip-view',
  standalone: true,
  imports: [DatePipe, HighlightDatePipe, NavbarComponent, MatProgressSpinnerModule],
  templateUrl: './trip-view.component.html',
  styleUrl: './trip-view.component.css'
})
export class TripViewComponent implements OnInit{


  route = inject(ActivatedRoute);
  tripsService =  inject(TripsService);

  loading: WritableSignal<boolean> = signal(true);
  trip: Trip | null = null;

  ngOnInit(): void {
    const id = this.route.snapshot.params['id'];
    this.getTrip(id)
  }

  async getTrip(id: any){
    await this.tripsService.getById(id).then(res => {
      this.trip = res;
      this.loading.set(false);
    })
    console.log();
  }

}
