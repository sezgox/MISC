import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { jwtDecode } from 'jwt-decode';
import { ToastrService } from 'ngx-toastr';
import { Note } from 'src/app/interfaces/note';
import { NotesService } from 'src/app/services/notes.service';

@Component({
  selector: 'app-note',
  templateUrl: './note.component.html',
  styleUrls: ['./note.component.css']
})
export class NoteComponent implements OnInit{

  constructor(private notesService: NotesService, private toastr: ToastrService){}

  @Input({required: true}) info: Note;

  ownProfile: boolean;

  @Output() noteRemoved = new EventEmitter<string>();

  ngOnInit():void{
    const decodedToken: any = jwtDecode(localStorage.getItem('AUTH_TOKEN'));
    this.ownProfile = this.info.user == decodedToken.username;
  }

  removeNote(id: string){
    this.notesService.removeNote(id).subscribe({
      next:(result) => {
        this.toastr.show(result.msg);
        this.noteRemoved.emit(id);
      },error:(err) => {
        this.toastr.show(err);
      }
    })
  }

}
