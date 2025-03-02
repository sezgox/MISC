import { formatDate } from '@angular/common';
import { Component, ElementRef, input, OnChanges, SimpleChanges } from '@angular/core';
import * as Plot from '@observablehq/plot';
import { Freedays } from '../../../core/interfaces/freedays.interface';
import { Trip } from '../../../core/interfaces/trips.interface';

@Component({
  selector: 'app-graph',
  standalone: true,
  imports: [],
  template: `<div #chartContainer></div>`,
  styles: ['div { width: 100%; height: 400px; }']
})
export class GraphComponent implements OnChanges{

  freedays = input<Freedays[]>([]);
  minDate = input<Date>();
  maxDate = input<Date>();
  trips = input<Trip[]>([]);
  showTrips = input<boolean>(false);

  constructor(private el: ElementRef) {}

  renderChart() {
    const container = this.el.nativeElement.querySelector('div');

    // 🔥 Eliminar el gráfico anterior antes de renderizar uno nuevo
    while (container.firstChild) {
      container.removeChild(container.firstChild);
    }

    const formattedData = this.freedays().map(d => ({
      username: d.username,
      startDate: new Date(d.startDate),
      endDate: new Date(d.endDate),
      label: `${formatDate(new Date(d.startDate), 'dd/MM/YYYY', 'es-ES')} - ${formatDate(new Date(d.endDate), 'dd/MM/YYYY', 'es-ES')}`
    }));
    if(this.showTrips() && this.trips().length > 0){
      const tripsInfo = this.trips().map(t => ({
        username:  `${t.destination}(viaje)`,
        startDate: new Date(t.startDate),
        endDate: new Date(t.endDate),
        label: `${formatDate(new Date(t.startDate), 'dd/MM/YYYY', 'es-ES')} - ${formatDate(new Date(t.endDate), 'dd/MM/YYYY', 'es-ES')}`
      }));
      for(const t of tripsInfo){
        formattedData.push(t)
      }
    }
    const differentUsers = new Set(formattedData.map(d => d.username));

    const chart = Plot.plot({
      marginLeft: 80,
      height: 100*differentUsers.size,
      x: { axis: "top", grid: true },
      y: { domain: formattedData.map(d => d.username), label: "Miembro",  }, // Muestra nombres en Y
      marks: [
        Plot.barX(formattedData, {
          x1: "startDate",
          x2: "endDate",
          y: "username",
          fill: "username",
        }),
        Plot.tip(formattedData, Plot.pointerX({x1: "startDate", x2: "endDate", y: "username", fill: "var(--background-contrast-color)", stroke: "var(--primary-color)", title: (d) => d.label}))
      ]
    });

    this.el.nativeElement.querySelector('div').appendChild(chart);
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes) {
      this.renderChart();
    }
  }
}
