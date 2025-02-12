import { Component, inject, OnInit, signal, WritableSignal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { GroupsService } from '../../core/services/groups.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [FormsModule, RouterLink],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css'
})
export class RegisterComponent implements OnInit {

  route = inject(ActivatedRoute);
  router = inject(Router);
  groupsService = inject(GroupsService);

  create: WritableSignal<boolean> = signal(true);
  groupId: string = '68af56cf-586b-43cf-9a49-b03fc3e45b1d'
  groupName: string = '';

  ngOnInit(): void {
    this.route.queryParamMap.subscribe({
      next: async params => {
        this.groupId = params.get('group') ?? '';
        if(this.groupId){
          const group = await this.groupsService.getGroupById(this.groupId);
          if(group){
            this.groupName = group.name;
            this.create.set(false);
          }else{
            this.router.navigate(['register']);
          }
          return;
        }
      }
    });
  }


}
