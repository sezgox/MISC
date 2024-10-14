import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { jwtDecode } from 'jwt-decode';
import { ToastrService } from 'ngx-toastr';
import { Note } from 'src/app/interfaces/note';
import { UsersService } from 'src/app/services/users.service';
import { NotesService } from '../../../services/notes.service';


@Component({
  selector: 'app-my-notes',
  templateUrl: './my-notes.component.html',
  styleUrls: ['./my-notes.component.css']
})
export class MyNotesComponent {
  filter={};
  notes: any[];
  loading: boolean = true;

  constructor(private notesService: NotesService, private router: Router, private profileService: UsersService, private toastr: ToastrService){}

  ngOnInit():void{
    const decodedToken: any = jwtDecode(localStorage.getItem('AUTH_TOKEN'));
    const username = decodedToken.username;
    this.filter = {
      username: username
    }
    this.getMyNotes(this.filter)
  }

  async getMyNotes(filter){
    const result = await this.notesService.getNotes(filter);
    if(result === false){
      this.toastr.show('No fue posble recuperar las notas')
      this.loading = false;
    }else{
      this.notes = result as Note[];
    }
    this.loading = false;
  }

  removeNote(id: string){
    this.notes = this.notes.filter(note => note.id !== id)
  }

}
