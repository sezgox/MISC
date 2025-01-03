import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'highlightDate',
  standalone: true,
})
export class HighlightDatePipe implements PipeTransform {
  transform(value: string | null): string {
    if (value == null) return '';

    // Regex para encontrar días (01, 02, etc.), meses (enero, febrero, etc.), y años (2024, 2025, etc.)
    const dateRegex = /\b(0?[1-9]|[12]\d|3[01])\b|enero|febrero|marzo|abril|mayo|junio|julio|agosto|septiembre|octubre|noviembre|diciembre|\b(19|20)\d{2}\b/gi;

    // Reemplaza los valores encontrados por una versión coloreada
    return value.replace(dateRegex, (match) => {
      return `<span class="highlight">${match}</span>`;
    });
  }
}
