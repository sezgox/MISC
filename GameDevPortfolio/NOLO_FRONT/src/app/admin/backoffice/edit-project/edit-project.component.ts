import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Project } from 'src/app/core/interfaces/Project';
import { ProjectsService } from 'src/app/core/services/projects.service';

@Component({
  selector: 'app-edit-project',
  standalone: true,
  imports: [FormsModule,RouterLink],
  templateUrl: './edit-project.component.html',
  styleUrl: './edit-project.component.css'
})
export class EditProjectComponent implements OnInit{

  selectedFiles: any[] = [];
  
  base64Image: string | ArrayBuffer | null = '';
  project: Project = {
    _id: '',
    title : '',
    description : '',
    genre: '',
    media : [],
    responsabilities: [],
    skills: [],
    links: [],
    date: ''
  }

  others: string = '';
  file: File | undefined = undefined;
  filename: string = '';

  roles: boolean = true;
  roleType: 'responsabilities' | 'skills' = 'responsabilities';
  
  projectsService = inject(ProjectsService);
  router = inject(Router);
  route = inject(ActivatedRoute);
  
  ngOnInit(): void {
    let projectName;
    this.route.paramMap.subscribe({
      next: (param) => {
        projectName = param.get('project');
        const encodedParam = encodeURIComponent(projectName ?? '');
        this.getProject(encodedParam);
      }
    })
  }

  getProject(projectName: string){
    this.projectsService.getProjectByName(projectName).subscribe({
      next: (result) => {
        if(result.success){
          this.project = result.data
          this.roles = this.project.responsabilities!.length > 0;
          this.roleType = this.roles ? 'responsabilities' : 'skills'
          if(this.project.others){
            this.others = this.project.others[0]
          }
          if(this.project.file){
            this.filename = this.project.file.split('/')[this.project.file.split('/').length - 1]
          }
        }
      }
    })
  }
  
  updateProject(){
    this.project.skills = this.project.skills?.filter(skill => skill)
    this.project.responsabilities = this.project.responsabilities?.filter(resp => resp)
    this.project.links = this.project.links?.filter(link => link.name && link.url)
    if(!this.project.title || !this.project.date){
      console.log('Rellena todos los campos!!')
    }else{
      if(this.others){
        this.project.others = [];
        this.project.others.push(this.others);
      }else{
        this.project.others = [];
      }
      if(this.filename !== this.project.file?.split('/')[this.project.file.split('/').length - 1]){
        this.project.file = '';
      }
      const formData = new FormData();
      if(this.file){
        formData.append('files',this.file);
        console.log(this.file)
      }
      this.selectedFiles = this.selectedFiles.filter(file => typeof file != 'string')
      
      formData.append('project',JSON.stringify(this.project));
      this.selectedFiles.forEach(file => {
        formData.append('media',file);
      });
      if(this.project._id){
        this.projectsService.updateProject(formData,this.project._id).subscribe({
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
  }
  
  removeImage(index: number){
    this.selectedFiles = this.selectedFiles.filter(file => file.name != this.project.media![index])
    this.project.media?.splice(index,1);
  }

  removeFile(){
    this.file = undefined;
    this.filename = '';
  }

  onFileSelected(event: any) {
    const file:File = event.target.files[0];
    if(event.target.id == 'image'){
      this.project.media?.push(file.name);
      this.selectedFiles.push(file);
    }else{
      this.file = file;
      this.filename = this.file.name;
    }
  }
  addField(field: string){
    if(field == 'responsabilities' || field == 'skills'){
      this.project[field]?.push('');
    }
    if(field == 'links'){
      this.project[field]?.push({name: '',url: ''});
    }
  }

  removeField(field:string,index:number){
    if(field == 'links' || field == 'responsabilities' || field == 'skills'){
      this.project[field]?.splice(index,1);
    }
  }

  toggleRoles(){
    this.roleType = this.roles == true ? 'responsabilities' : 'skills';
  }

}
