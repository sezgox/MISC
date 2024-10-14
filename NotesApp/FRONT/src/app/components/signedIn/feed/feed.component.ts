import { Component } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { Note } from 'src/app/interfaces/note';
import { NotesService } from '../../../services/notes.service';

@Component({
  selector: 'app-feed',
  templateUrl: './feed.component.html',
  styleUrls: ['./feed.component.css']
})
export class FeedComponent {
  filter={
    showAll: "true",
    username: undefined,
    date: undefined
  };
  notes: Note[];
  loading: boolean = true;
  username: string;
  date;

  constructor(private notesService: NotesService,private toastr: ToastrService){

  }

  ngOnInit():void{
    this.getFeedNotes(this.filter);
  }

  save(){
    this.filter.username = this.username;
    this.filter.date = this.date;
    this.getFeedNotes(this.filter);
  }

  async getFeedNotes(filter){
    this.loading = true;
    const result = await this.notesService.getNotes(filter);
    if(result === false){
      this.toastr.show('No fue posbile recuperar las notas')
    }else{
      this.notes = result as Note[];
    }
    this.loading =  false;
  }

  removeNote(id: string){
    this.notes = this.notes.filter(note => note.id !== id)
  }
}
