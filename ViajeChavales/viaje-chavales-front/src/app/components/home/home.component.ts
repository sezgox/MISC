import { KeyValuePipe } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import * as echarts from 'echarts';
import { Freedays } from '../../core/interfaces/freedays.interface';
import { Trip } from '../../core/interfaces/trips.interface';
import { FreedaysService } from '../../core/services/freedays.service';
import { TripsService } from '../../core/services/trips.service';
import { NavbarComponent } from '../navbar/navbar.component';
import { UsersService } from './../../core/services/users.service';


interface serieConfig {
  name: string;
  type: string;
  symbol: string;
  lineStyle: {
    width: number;
    color: string;
  }
  data: any[];
}


@Component({
  selector: 'app-home',
  standalone: true,
  imports: [FormsModule, NavbarComponent, MatSelectModule, MatFormFieldModule, KeyValuePipe],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css',
})

export class HomeComponent implements OnInit {

  freedaysService = inject(FreedaysService);
  usersService = inject(UsersService);
  tripsService = inject(TripsService)

  freedays: Freedays[] = [];
  trips: Trip[] = [];

  showTrips: boolean = false;
  graphicOptions: any = {};
  selectedOption: string = '';
  yearOptions: number[] = [];
  selectedYear: number = 0;

  chartConfig = {
    tooltip: {
      trigger: 'axis',
      formatter: (params: any) => {
        const grouped: Record<string, string[]> = {};

        // Group data by category (Y-axis value)
        params.forEach((item: any) => {
          if (item.data && item.data[0] !== null && item.data[1] !== null) {
            const category = item.data[1]; // Y-axis value (e.g., P1, P2, etc.)
            const date = echarts.time.format(item.data[0], '{yyyy}/{MM}/{dd}', false);

            if (!grouped[category]) {
              grouped[category] = []; // Initialize array if not present
            }
            grouped[category].push(date);
          }
        });

        // Build tooltip content
        return Object.entries(grouped)
          .map(([category, dates]) => {
            // Pair dates into ranges
            const ranges = [];
            for (let i = 0; i < dates.length; i += 2) {
              const start = dates[i];
              const end = dates[i + 1] || '...'; // If there's no second date, append '...'
              ranges.push(`${start} - ${end}`);
            }

            // Combine ranges for the category
            return `<strong>${category}</strong><br>  ${ranges.join('<br>')}`;
          })
          .join('<br>'); // Separate each category with a line break
      },
    },
    title: {
      text: 'Dias Libres',
    },
    xAxis: {
      type: 'time',
      name: 'Fechas',
      min: '',
      max: '',
      splitLine: {
        show: true, // Mostrar líneas verticales
        lineStyle: {
          type: 'dashed', // Línea discontinua
          color: '#ccc', // Color de las líneas
        },
      },
      axisLabel: {
        fformatter: (value: number): string => {
          const currentYear = new Date().getFullYear();
          // Fecha base: 1 de enero del año actual
          const baseDate = new Date(currentYear, 0, 1);
          baseDate.setHours(0, 0, 0, 0); // Aseguramos que sea el inicio del día

          // Diferencia en milisegundos desde el 1 de enero
          const diffInMillis = value - baseDate.getTime();

          // Calcular el número exacto de meses desde el 1 de enero
          const months = diffInMillis / (30 * 24 * 60 * 60 * 1000); // Aproximación de días por mes
          const monthNumber = months >= 0 ? Math.round(months) : Math.floor(months);

          // Ajustar la fecha sumando meses exactos
          const adjustedDate = new Date(baseDate);
          adjustedDate.setMonth(baseDate.getMonth() + monthNumber);

          // Formatear el día (1 de cada mes) y el mes
          const day = '01'; // Siempre el primer día del mes
          const month = adjustedDate.toLocaleString('es-ES', { month: 'short' }); // Mes en español

          // Devolver el formato deseado: "01 mes"
          return `${day} ${month}`;
        },
        showMinLabel: true, // Mostrar la etiqueta para la fecha inicial
        showMaxLabel: true, // Mostrar la etiqueta para la fecha final
        interval: 1, // Asegurar que todas las fechas sean visibles
      },
    },
    yAxis: {
      type: 'category',
      data: [] as string[],
      name: 'Chavales',
    },
    series: [] as serieConfig[]
  }

  colors: string[] = ["#FF0000", "#00FF00", "#0000FF", "#FFA500", "#00FFFF", "#FF00FF", "#FFFF00", "#00FFA5", "#FF0000", "#00FF00", "#0000FF", "#FFA500", "#00FFFF", "#FF00FF", "#FFFF00", "#00FFA5"];



  ngOnInit(): void {
    this.getPeriodsAvailable();
    this.getTrips();
    this.getFreedays();
  }


  getPeriodsAvailable(year?: number, periodSelected: boolean = false){
    const today = new Date();
    const currentYear = today.getFullYear();
    const currentMonth = today.getMonth() + 1;
    year = year || currentYear;
      this.graphicOptions = {
        [`Periodo 1`]: this.getSeasonDate(year, 1),
        [`Periodo 2`]: this.getSeasonDate(year, 2),
        [`Periodo 3`]: this.getSeasonDate(year, 3),
        [`Periodo 4`]: this.getSeasonDate(year, 4),
        [`Periodo 5`]: this.getSeasonDate(year, 5),
        [`Periodo 6`]: this.getSeasonDate(year, 6)
      }
      if(!periodSelected){
        if([1,2].includes(currentMonth)){
          this.selectedOption = `Periodo 1`;
        }else if([3,4].includes(currentMonth)){
          this.selectedOption = `Periodo 2`;
        }else if([5,6].includes(currentMonth)){
          this.selectedOption = `Periodo 3`;
        }else if([7,8].includes(currentMonth)){
          this.selectedOption = `Periodo 4`;
        }else if([9,10].includes(currentMonth)){
          this.selectedOption = `Periodo 5`;
        }else if([11,12].includes(currentMonth)){
          this.selectedOption = `Periodo 6`;
        }
      }
    this.yearOptions = [currentYear, currentYear + 1];
    this.selectedYear = year;
    this.chartConfig.xAxis.min = this.graphicOptions[this.selectedOption].start;
    this.chartConfig.xAxis.max = this.graphicOptions[this.selectedOption].end;
    this.renderChart()
  }

  getSeasonDate(year: number, period: number){
    if(period == 1){
      return {
        start: new Date(year, 0, 1),
        end: new Date(year, 2, 1)
      }
    }else if(period == 2){
      return {
        start: new Date(year, 2, 1),
        end: new Date(year, 4, 1)
      }
    }else if(period == 3 ){
      return {
        start: new Date(year, 4, 1),
        end: new Date(year, 6, 1)
      }
    }else if(period == 4 ){
      return {
        start: new Date(year, 6, 1),
        end: new Date(year, 8, 1)
      }
    }else if(period == 5 ){
      return {
        start: new Date(year, 8, 1),
        end: new Date(year, 10, 1)
      }
    }else if(period == 6 ){
      return {
        start: new Date(year, 10, 1),
        end: new Date(year, 12, 1)
      }
    }else{
      return;
    }
  }


  getFreedays(){
    this.freedaysService.getFreedays().then(res => {
      this.freedays = res;
      console.log(this.freedays)
      this.initConfig();
    });
  }

  initConfig(){
    this.configSeries();
  }

  async configSeries(){
    this.chartConfig.yAxis.data = [];
    let series: serieConfig[] = [];
    const serieConfigBase: serieConfig = {
      name: '',
      type: 'line',
      symbol: 'none',
      lineStyle: {
        width: 2,
        color: 'lightblue'
      },
      data: []
    }
    const users = await this.usersService.getUsers();
    for(let user of users){
      this.chartConfig.yAxis.data.push(user.username)
      const freeday = this.freedays.find(fd => fd.username === user.username);
      if(freeday && freeday.username == user.username){
        const serieConfig = {
          ...serieConfigBase,
          lineStyle: { ...serieConfigBase.lineStyle },
          data: [] as any[]
        };
        for(let fd of this.freedays){
          if(fd.username == user.username){
            serieConfig.data.push([fd.startDate, fd.username]);
            serieConfig.data.push([fd.endDate, fd.username]);
            serieConfig.data.push(null);
            }
          }
        serieConfig.lineStyle.color = this.colors[users.indexOf(user)];
        serieConfig.name = freeday.username;
        series.push(serieConfig)
      }
    }

    if(this.showTrips){
      for(let trip of this.trips){
        const serieConfig = {
          ...serieConfigBase,
          lineStyle: { ...serieConfigBase.lineStyle },
          data: [] as any[]
        };
        serieConfig.name = trip.destination;
        serieConfig.data.push([trip.startDate, trip.destination]);
        serieConfig.data.push([trip.endDate, trip.destination]);
        serieConfig.data.push(null);
        this.chartConfig.yAxis.data.push(serieConfig.name);
        series.push(serieConfig)
      }
    }
    this.chartConfig.series = series;
    console.log(this.chartConfig.xAxis)
    this.renderChart();
  }

  renderChart(){
    const myChart = echarts.init(document.getElementById("chart"));
    myChart.setOption(this.chartConfig);
    myChart.on('click', function(params) {
      // Print name in console
      console.log('Clicked on', params.name);
    });
  }

  onChangeTrips(){
    if(this.showTrips){
      this.getTrips();
      this.configSeries();
    }else{
      this.configSeries();
    }
  }

  async getTrips(){
    this.trips = await this.tripsService.getTrips();
  }

  onChangeOption(){
    this.getPeriodsAvailable(this.selectedYear, true);
  }
}
