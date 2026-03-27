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
  private static readonly GROUP_CHIP_MAX = 12;

  @Input({ required: true }) trip!: Trip;
  @Input() canRemove = false;
  @Output() onDiscard = new EventEmitter<number>();
  @Output() onReactivate = new EventEmitter<number>();
  @Output() onDelete = new EventEmitter<number>();

  get groupLabelRaw(): string {
    return this.trip.group?.name?.trim() || this.trip.groupId || 'Sin grupo';
  }

  get groupLabel(): string {
    if (this.groupLabelRaw.length <= TripCardComponent.GROUP_CHIP_MAX) {
      return this.groupLabelRaw;
    }

    return `${this.groupLabelRaw.slice(0, TripCardComponent.GROUP_CHIP_MAX)}...`;
  }

  get acceptedCount() {
    return [
      this.trip.acceptedAccommodationProposal,
      this.trip.acceptedTransportProposal,
      this.trip.acceptedVisitProposal,
    ].filter(Boolean).length;
  }

  get canReactivate(): boolean {
    const startDate = new Date(this.trip.startDate);
    if (Number.isNaN(startDate.getTime())) {
      return false;
    }

    const startMidnight = new Date(startDate);
    startMidnight.setHours(0, 0, 0, 0);

    const todayMidnight = new Date();
    todayMidnight.setHours(0, 0, 0, 0);

    return startMidnight > todayMidnight;
  }

  discardTrip() {
    this.onDiscard.emit(this.trip.id);
  }

  reactivateTrip() {
    if (!this.canReactivate) {
      return;
    }
    this.onReactivate.emit(this.trip.id);
  }

  deleteTrip() {
    this.onDelete.emit(this.trip.id);
  }
}
