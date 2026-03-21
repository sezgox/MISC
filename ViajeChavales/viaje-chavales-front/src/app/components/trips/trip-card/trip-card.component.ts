import { DatePipe, DecimalPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Trip } from '../../../core/interfaces/trips.interface';
import { HighlightDatePipe } from '../../../core/pipes/highlightDate.pipe';

@Component({
  selector: 'app-trip-card',
  standalone: true,
  imports: [HighlightDatePipe, DatePipe, DecimalPipe, RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './trip-card.component.html',
  styleUrl: './trip-card.component.css'
})
export class TripCardComponent {
  @Input({ required: true }) trip!: Trip;
  @Input() canRemove = false;
  @Output() onRemove = new EventEmitter<number>();

  get acceptedCount() {
    return [
      this.trip.acceptedAccommodationProposal,
      this.trip.acceptedTransportProposal,
      this.trip.acceptedVisitProposal,
    ].filter(Boolean).length;
  }

  deleteTrip() {
    this.onRemove.emit(this.trip.id);
  }
}
