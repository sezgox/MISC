import { ChangeDetectionStrategy, Component, inject, OnInit, signal, WritableSignal } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { provideNativeDateAdapter } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { ToastrService } from 'ngx-toastr';
import { Trip } from '../../core/interfaces/trips.interface';
import { TripsService } from '../../core/services/trips.service';
import { UsersService } from '../../core/services/users.service';
import { NavbarComponent } from '../navbar/navbar.component';
import { TripCardComponent } from './trip-card/trip-card.component';

@Component({
  selector: 'app-trips',
  standalone: true,
  imports: [MatFormFieldModule, MatDatepickerModule, FormsModule, ReactiveFormsModule, NavbarComponent, MatInputModule,  TripCardComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [provideNativeDateAdapter()],
  templateUrl: './trips.component.html',
  styleUrl: './trips.component.css'
})
export class TripsComponent implements OnInit {

  tripsService = inject(TripsService);
  usersService = inject(UsersService);
  toastr = inject(ToastrService)

  myTrips: WritableSignal<Trip[]> = signal([]);
  otherTrips: WritableSignal<Trip[]> = signal([]);

  range = new FormGroup({
    start: new FormControl<Date>(new Date(), [Validators.required,]),
    end: new FormControl<Date>(new Date(), [Validators.required]),
  });

  ngOnInit(): void {
    this.getTrips();
  }

  async getTrips(){
    const trips = await this.tripsService.getTrips();
    for(let trip of trips) {
      const pts = await this.tripsService.getParticipants(trip.id);
      trip.participants = [];
      for(let pt of pts){
        trip.participants.push(pt.userId);
      }
    };
    this.myTrips.set(trips.filter(trip => trip.userId == this.usersService.getUsername()));
    this.otherTrips.set(trips.filter(trip => trip.userId != this.usersService.getUsername()));
  }

  async addTrip(){
    const minDate: Date = (() => {
      const date = new Date();
      date.setHours(0, 0, 0, 0); // Reinicia las horas, minutos, segundos y milisegundos
      return date;
    })();
    if(this.range.value.start && this.range.value.end && this.range.valid && this.range.value.start < this.range.value.end && this.range.value.start >= minDate){
      const trip =  {
        destination: 'Paris',
        startDate: this.range.value.start,
        endDate: this.range.value.end
        }
        await this.tripsService.addTrip(trip)
        .then( res => {
          this.toastr.success('Propuesta de viaje agregado');
          this.getTrips();
        })
        .catch(err => {
          this.toastr.error(err.error.message, 'Error al agregar el viaje');
          console.log(err);
        })
      }else{
        this.toastr.error('Datos inválidos')
      }
    }

  deleteTrip(tripId: number){
      this.tripsService.removeTrip(tripId).then(res => {
        this.toastr.success('Viaje eliminado');
        this.getTrips();
      }).catch(err => this.toastr.error(err.error.message, 'Error al eliminar el viaje'));
  }

}
