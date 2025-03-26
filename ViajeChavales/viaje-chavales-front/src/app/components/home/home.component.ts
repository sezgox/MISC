import { Component, inject, OnInit, signal, WritableSignal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { Freedays } from '../../core/interfaces/freedays.interface';
import { Trip } from '../../core/interfaces/trips.interface';
import { FreedaysService } from '../../core/services/freedays.service';
import { TripsService } from '../../core/services/trips.service';
import { ChatComponent } from '../shared/chat/chat.component';
import { GraphComponent } from '../shared/graph/graph.component';
import { InviteComponent } from '../shared/invite/invite.component';
import { NavbarComponent } from '../shared/navbar/navbar.component';
import { UsersService } from './../../core/services/users.service';


@Component({
  selector: 'app-home',
  standalone: true,
  imports: [FormsModule, NavbarComponent, MatSelectModule, MatFormFieldModule, InviteComponent, GraphComponent, ChatComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css',
})

export class HomeComponent implements OnInit {

  freedaysService = inject(FreedaysService);
  usersService = inject(UsersService);
  tripsService = inject(TripsService)

  freedays: WritableSignal<Freedays[]> = signal([]);
  trips: Trip[] = [];

  showTrips: boolean = false;

  currentYear = new Date( Date.now()).getFullYear()
  selectedYear: number = this.currentYear;
  yearOptions: number[] = [
    this.currentYear,
    this.currentYear + 1,
  ]

  selectedPeriod: string = 'Invierno';
  yearPeriods: string[] = [
    'Invierno',
    'Primavera',
    'Verano',
    'Otoño'
  ]

  ngOnInit(): void {
    this.getFreedays();
  }

  getFreedays(){
    let startMonth: number;
    let endMonth: number;
    if(this.selectedPeriod === 'Invierno'){
      startMonth = 11;
      endMonth = 2;
    }else if(this.selectedPeriod === 'Primavera'){
      startMonth = 2;
      endMonth = 5;
    }else if(this.selectedPeriod === 'Verano'){
      startMonth = 5;
      endMonth = 8;
    }else if(this.selectedPeriod === 'Otoño'){
      startMonth = 8;
      endMonth = 11;
    }
    this.freedaysService.getFreedays().then(res => {
      let freedaysOnTimePeriod: Freedays[] = [];
      if(this.selectedPeriod != 'Invierno'){
        const freedaysOnYear = res.filter(d => new Date(d.startDate).getFullYear() >= this.selectedYear);
        freedaysOnTimePeriod = freedaysOnYear.filter((d) => new Date(d.startDate).getMonth() >= startMonth && new Date(d.startDate).getMonth() <= endMonth);
      }else{
        const freedaysOnYear = res.filter(d => new Date(d.startDate).getFullYear() >= this.selectedYear - 1);
        freedaysOnTimePeriod = freedaysOnYear.filter((d) =>
          (new Date(d.startDate).getMonth() == 12 && new Date(d.startDate).getFullYear() == this.selectedYear - 1) ||
          (new Date(d.startDate).getMonth() >= 1 && new Date(d.startDate).getMonth() <= endMonth && new Date(d.startDate).getFullYear() == this.selectedYear) );
          for(const d of freedaysOnYear){
            console.log(new Date(d.startDate).getMonth() >= 1 && new Date(d.startDate).getMonth() <= endMonth && new Date(d.startDate).getFullYear() == this.selectedYear)
          }
      }
      this.freedays.set(freedaysOnTimePeriod);
    });
  }

  async getTrips(){
    this.trips = await this.tripsService.getTrips();
  }

  checkTrips(startMonth: number, endMonth: number){
//TODO: check if trips are in the selected period
  }



}
