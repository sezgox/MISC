import { Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
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
  imports: [FormsModule, NavbarComponent],
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
      min: '2025-06-01',
      max: '2025-09-30',
      splitLine: {
        show: true, // Mostrar líneas verticales
        interval: 7 * 24 * 60 * 60 * 1000, // Intervalo de 7 días (una semana)
        lineStyle: {
          type: 'dashed', // Línea discontinua
          color: '#ccc', // Color de las líneas
        },
      },
      axisLabel: {
        formatter: (value: number): string => {
          // Calcular el número de semanas desde el 1 de enero de 2025
          const weekNumber = Math.ceil(
            (new Date(value).getTime() - new Date('2025-01-01').getTime()) /
            (7 * 24 * 60 * 60 * 1000) // Número de semanas
          );

          // Crear una fecha base del 1 de enero de 2025
          let date = new Date('2025-01-01');

          // Ajustar la fecha sumando las semanas calculadas
          date.setDate(date.getDate() + (weekNumber * 7));

          // Obtener el día y mes
          const day = String(date.getDate()).padStart(2, ''); // Asegura que el día tenga dos dígitos
          const month = date.toLocaleString('es-ES', { month: 'short' }); // Mes en español

          // Devolver el formato deseado: "dd mes"
          return `${day} ${month}`;
        },
        showMinLabel: true, // Mostrar la etiqueta para la fecha inicial
        showMaxLabel: true, // Mostrar la etiqueta para la fecha final
        interval: 0, // Asegurar que todas las fechas sean visibles
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
    this.getTrips();
    this.getFreedays();
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

}
