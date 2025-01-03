import { DatePipe, NgClass } from '@angular/common';
import { ChangeDetectionStrategy, Component, EventEmitter, inject, Input, OnInit, Output } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { ToastrService } from 'ngx-toastr';
import { Freedays } from '../../../core/interfaces/freedays.interface';
import { HighlightDatePipe } from './../../../core/pipes/highlightDate.pipe';

@Component({
  selector: 'app-fdcard',
  standalone: true,
  imports: [ HighlightDatePipe, DatePipe, NgClass, MatFormFieldModule, MatDatepickerModule, FormsModule, ReactiveFormsModule ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './fdcard.component.html',
  styleUrls: ['./fdcard.component.css',]
})
export class FdcardComponent implements OnInit {

  @Input({required: true}) fd!: Freedays;
  @Output() onRemove: EventEmitter<number> = new EventEmitter<number>();
  @Output() onUpdate: EventEmitter<Freedays> = new EventEmitter<Freedays>();

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
  ngOnInit(): void {
    const startDate = new Date(this.fd.startDate);
    startDate.setHours(0, 0, 0, 0);

    const endDate = new Date(this.fd.endDate);
    endDate.setHours(0, 0, 0, 0);

    this.previousDates.start = startDate;
    this.previousDates.end = endDate;
    this.range.setValue({ start: startDate, end: endDate });
  }

  editFd(fd: Freedays){
    const minDate: Date = (() => {
      const date = new Date();
      date.setHours(0, 0, 0, 0); // Reinicia las horas, minutos, segundos y milisegundos
      return date;
    })();
    if(this.range.value.start == this.previousDates.start && this.range.value.end == this.previousDates.end){
      this.toastr.info("No has modificado nada");
      return
    }
    if(this.range.value.start && this.range.value.end && this.range.valid && this.range.value.start < this.range.value.end && this.range.value.start >= minDate){
      this.fd.startDate = this.range.value.start;
      this.fd.endDate = this.range.value.end;
      this.onUpdate.emit(fd);
    }else{
      this.toastr.warning("Fechas inválidas");
    }
  }
}
