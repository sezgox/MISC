import { Component, Input } from '@angular/core';
import { User } from '@interfaces/user.interface';

@Component({
  selector: 'app-information',
  standalone: true,
  imports: [],
  templateUrl: './information.component.html',
  styleUrl: './information.component.css'
})
export class InformationComponent {

  @Input() user: User;

}
