import { get } from "http";

const countryNames: string[] = [];
async function getCountries(){
    const response = await fetch('https://restcountries.com/v3.1/all')
    const countries = await response.json();
    return countries;
}
getCountries()
.then(res => res.map(country => countryNames.push(country.name.common)));

export default countryNames;
