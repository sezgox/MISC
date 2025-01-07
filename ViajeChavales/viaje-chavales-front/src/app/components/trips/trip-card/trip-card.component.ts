import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, EventEmitter, inject, Input, Output } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { Trip } from '../../../core/interfaces/trips.interface';
import { TripsService } from '../../../core/services/trips.service';
import { HighlightDatePipe } from './../../../core/pipes/highlightDate.pipe';
@Component({
  selector: 'app-trip-card',
  standalone: true,
  imports: [ HighlightDatePipe, DatePipe, RouterLink ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './trip-card.component.html',
  styleUrl: './trip-card.component.css'
})
export class TripCardComponent {

  //TODO: OnInit buscar en tabla Participantes si el usuario es parte del viaje y si es asi, mostrar botón de "Unirse", si no, mostrar botón "Dejar viaje"

  @Input({required: true}) trip!: Trip;
  @Output() onRemove: EventEmitter<number> = new EventEmitter<number>();

  tripsService = inject(TripsService);
  toastr = inject(ToastrService);

  range = new FormGroup({
    start: new FormControl<Date>(new Date(), [Validators.required,]),
    end: new FormControl<Date>(new Date(), [Validators.required]),
  });

  previousDates =  {
    start: new Date(),
    end: new Date()
  }

  onEdit: boolean = false;
  isJoined: boolean = false;

  deleteTrip(){
    console.log(this.onRemove)
    this.onRemove.emit(this.trip.id);

  }


}
