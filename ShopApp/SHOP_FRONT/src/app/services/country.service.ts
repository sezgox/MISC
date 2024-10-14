import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CountryService {

  private http = inject(HttpClient);
  countryNames: string[];

  constructor() {
    this.countryNames = this.getCountryNames()
   }

  getCountries():Observable<[]>{
    return this.http.get<[]>('https://restcountries.com/v3.1/all');
  }

  getCountryNames(): string[]{
    const countryNames = [];
    this.getCountries().subscribe({
      next: (res) => {
        res.map((country: any) => countryNames.push(country.name.common));
      }
    });
    return countryNames;
  }
}
