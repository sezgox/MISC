import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AccountType } from 'src/app/core/consts/user-role.enum';

@Component({
  selector: 'app-menu',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './menu.component.html',
  styleUrl: './menu.component.css'
})
export class MenuComponent {

  AccountTypes = AccountType;

  @Input() menuOption: string;
  @Input() userRole: string;

  @Output() changeOption = new EventEmitter<string>();

  onChange(){
    this.changeOption.emit(this.menuOption);
  }
}
