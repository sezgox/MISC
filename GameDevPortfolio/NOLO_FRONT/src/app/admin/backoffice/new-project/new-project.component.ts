import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ProjectForm } from 'src/app/core/interfaces/Project';
import { ProjectsService } from 'src/app/core/services/projects.service';

@Component({
  selector: 'app-new-project',
  standalone: true,
  imports: [FormsModule,RouterLink],
  templateUrl: './new-project.component.html',
  styleUrl: './new-project.component.css'
})
export class NewProjectComponent {


  base64Image: string | ArrayBuffer | null = '';
  selectedFiles: any[] = [];
  project: ProjectForm = {
    title : '',
    description : '',
    genre: '',
    links: [],
    responsabilities: [],
    skills: [],
    date: new Date().toISOString()
  }

  others: string = '';
  file: File | undefined = undefined;

  roles: boolean = true;
  roleType: 'responsabilities' | 'skills' = 'responsabilities';

  projectsService = inject(ProjectsService);
  router = inject(Router);

  uploadProject(){
    this.project.skills = this.project.skills?.filter(skill => skill)
    this.project.responsabilities = this.project.responsabilities?.filter(resp => resp)
    this.project.links = this.project.links?.filter(link => link.name && link.url)
    if(!this.project.title || !this.project.date){
      console.log('Rellena todos los campos!!')
      return
    }else{
      if(this.others){
        this.project.others = [];
        this.project.others.push(this.others);
      }
      const formData = new FormData();
      if(this.file){
        formData.append('files',this.file);
        console.log(this.file)
      }
      formData.append('project',JSON.stringify(this.project));
      this.selectedFiles.forEach(file => {
        formData.append('media',file);
      });
      this.projectsService.uploadProject(formData).subscribe({
        next: (result) => {
          if(!result.success){
            console.log(result.data)
          }else{
            console.log(result.data)
            this.router.navigate(['/admin/backoffice']);
          }
        },error: (err) => {
          console.log(err)
        }
      })
    }
  }
  
  removeImage(index: number){
    this.selectedFiles.splice(index,1);
  }


  onFileSelected(event: any) {
    const file:File = event.target.files[0];
    if(event.target.id == 'image'){
      this.selectedFiles.push(file);
    }else{
      this.file = file;
    }
  }

  addField(field: string){
    if(field == 'responsabilities' || field == 'skills'){
      this.project[field]?.push('');
    }else if(field == 'links'){
      this.project[field]?.push({name:'',url:''});
    }
  }

  removeField(field:string,index:number){
    if(field == 'links' || field == 'responsabilities' || field == 'skills'){
      this.project[field]?.splice(index,1);
    }
  }

  toggleRoles(){
    this.roles = !this.roles
    this.roleType = this.roles == true ? 'responsabilities' : 'skills'
  }
}
