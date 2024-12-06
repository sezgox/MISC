import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-menu',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './menu.component.html',
  styleUrl: './menu.component.css'
})
export class MenuComponent {

  @Input() menuOption: string;
  @Input() userRole: string;

  @Output() changeOption = new EventEmitter<string>();

  onChange(){
    this.changeOption.emit(this.menuOption);
  }
}
