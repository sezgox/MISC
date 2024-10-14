import { Component } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { Note } from 'src/app/interfaces/note';
import { NotesService } from 'src/app/services/notes.service';


@Component({
  selector: 'app-edit',
  templateUrl: './edit.component.html',
  styleUrls: ['./edit.component.css']
})
export class EditComponent {

  note: Note;
  id: string;
  isPublic: boolean;

  editForm: FormGroup;
  
  

  constructor(private notesService: NotesService,private route: ActivatedRoute, private router: Router, private toastr: ToastrService){ }

  ngOnInit():void{
    this.getId();
  }

  getId(){
    this.route.params.subscribe(params => {
      this.id = params['id'];
  });
  this.getNote();
}

  async getNote(){
    const result = await this.notesService.getNoteToEdit(this.id);
    if(result == false){
      this.router.navigate(['/notes'])
      return
    }else{
      this.note = result as Note;
      const title = new FormControl(this.note.title,[Validators.required]);
      const description = new FormControl(this.note.description,[Validators.required]);
      const showAll = new FormControl(this.note.showAll.toString(),[Validators.required]);
      this.editForm = new FormGroup({
        title: title,
        description: description,
        showAll: showAll
      });
    }
    
  }

  getNoteEdited(){
    const editedNote: Note = {
      title: this.editForm.value.title,
      description: this.editForm.value.description,
      showAll: this.editForm.value.showAll
    }
    const result = this.notesService.editNote(this.id,editedNote);
    if(result){
      this.toastr.show('Note edited')
      this.router.navigate(['/notes'])
    }else{
      this.toastr.show('Unable to edit note, try again later :(')
      this.router.navigate(['/notes'])
    }
  }

}
