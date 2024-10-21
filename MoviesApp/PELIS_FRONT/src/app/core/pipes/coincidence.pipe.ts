import { inject, Pipe, PipeTransform } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

@Pipe({
  name: 'coincidence',
  standalone: true
})
export class CoincidencePipe implements PipeTransform {

  sanitizer = inject(DomSanitizer);

  transform(value: string, searchText: string): SafeHtml  {
    console.log(value)
    if(!searchText) return value

      const regex = new RegExp(`(${searchText})`, 'gi');

      const highlighted = value.replace(regex, `<span style="color: rgb(230, 230, 0);">$1</span>`);
      return this.sanitizer.bypassSecurityTrustHtml(highlighted);
    }


}
