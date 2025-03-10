import { ChangeDetectionStrategy, Component, inject, OnInit, signal, WritableSignal } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { provideNativeDateAdapter } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { ToastrService } from 'ngx-toastr';
import { CreateTripDto, Trip } from '../../core/interfaces/trips.interface';
import { TripsService } from '../../core/services/trips.service';
import { UsersService } from '../../core/services/users.service';
import { NavbarComponent } from '../shared/navbar/navbar.component';
import { TripCardComponent } from './trip-card/trip-card.component';

@Component({
  selector: 'app-trips',
  standalone: true,
  imports: [MatFormFieldModule, MatDatepickerModule, FormsModule, ReactiveFormsModule, NavbarComponent, MatInputModule, TripCardComponent],
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
    start: new FormControl<Date>(new Date(), [Validators.required]),
    end: new FormControl<Date>(new Date(), [Validators.required]),
  });

  destination: string = '';
  price: number | null = null;
  accomodation: string  = '';
  details: string = '';

  urlPattern = /^https:\/\/[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;


  ngOnInit(): void {
    this.getTrips();
  }

  //TODO: VER TRIPS SOLO DEL GRUPO... NO TODOS LOS TRIPS
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
    if(this.destination == ''){
      this.toastr.error('Necesitas indicar el destino');
      return
    }
    if(this.range.value.start && this.range.value.end && this.range.valid && this.range.value.start < this.range.value.end && this.range.value.start >= minDate){
      const trip: CreateTripDto =  {
        destination: this.destination,
        startDate: this.range.value.start,
        endDate: this.range.value.end,
        details: this.details
        }
        if(this.price){
          trip.price = this.price;
        }
        if(this.accomodation != '' && !this.urlPattern.test(this.accomodation)){
          this.toastr.error('La url no es válida');
          return
        }else{
          trip.accomodation = this.accomodation;
        }
        await this.tripsService.addTrip(trip)
        .then( res => {
        console.log(res)

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
        console.log(res)
        this.getTrips();
      }).catch(err => {
        this.toastr.error(err.error.message, 'Error al eliminar el viaje')
        console.log(err);
      });
  }

}
