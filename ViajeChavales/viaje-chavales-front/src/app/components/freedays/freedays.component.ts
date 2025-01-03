import { ChangeDetectionStrategy, Component, inject, OnInit, signal, WritableSignal } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { provideNativeDateAdapter } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ToastrService } from 'ngx-toastr';
import { Freedays } from '../../core/interfaces/freedays.interface';
import { FreedaysService } from '../../core/services/freedays.service';
import { UsersService } from '../../core/services/users.service';
import { NavbarComponent } from '../navbar/navbar.component';
import { FdcardComponent } from './fdcard/fdcard.component';


@Component({
  selector: 'app-freedays',
  standalone: true,
  imports: [ NavbarComponent, MatProgressSpinnerModule, MatFormFieldModule, MatDatepickerModule, FormsModule, ReactiveFormsModule, FdcardComponent ],
  providers: [provideNativeDateAdapter()],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './freedays.component.html',
  styleUrl: './freedays.component.css'
})
export class FreedaysComponent implements OnInit {

  minDate: Date = (() => {
    const date = new Date();
    date.setHours(0, 0, 0, 0); // Reinicia las horas, minutos, segundos y milisegundos
    return date;
  })();
  range = new FormGroup({
    start: new FormControl<Date>(this.minDate, [Validators.required,]),
    end: new FormControl<Date>(new Date(new Date(this.minDate).setDate(this.minDate.getDate() + 1)), [Validators.required]),
  });

  freedaysService = inject(FreedaysService);
  usersService = inject(UsersService);
  toastrService = inject(ToastrService);

  loading: WritableSignal<boolean> = signal(true);
  addFreeday: boolean = false;

  freedays: Freedays[] = [];


  ngOnInit(): void {
    this.getFreedays();
  }

  getFreedays(){
    this.loading.set(true);
    this.freedaysService.getFreedays(this.usersService.getUsername()).then(res => {
      this.loading.set(false);
      this.freedays = res;
    })
  }

  addFreedays(){
    if(this.range.value.start && this.range.value.end && this.range.valid && this.range.value.start < this.range.value.end && this.range.value.start >= this.minDate){
        const freeday = {
          startDate: this.range.value.start,
          endDate: this.range.value.end ,
        }
        console.log(freeday);
        this.freedaysService.addFreeday(freeday).then(res => {
          this.toastrService.success(freeday.startDate.toLocaleDateString() + ' - ' + freeday.endDate.toLocaleDateString(), 'Periodo agregado');
          this.getFreedays()
        }).catch(err => {
          console.log(err);
          this.toastrService.error( err.error.message, 'Error al agregar el periodo');
        })
      }else{
        this.toastrService.warning('Fechas inválidas');
      }
  }

  removeFreeday(id: number){
    this.toastrService.info('Eliminando...')
    this.freedaysService.removeFreeday(id).then(res => {
      this.getFreedays();
      this.toastrService.clear();
      this.toastrService.success("Periodo eliminado");
    });
  }

  updateFreeday(fd: Freedays){
    this.freedaysService.updateFreeday(fd).then(res => {
      this.getFreedays();
    }).catch(err => {
      console.log(err);
      this.toastrService.error( err.error.message, 'Error al editar el periodo');
    })
  }

}
