import { Component, OnInit, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { Project } from 'src/app/core/interfaces/Project';
import { ProjectsService } from 'src/app/core/services/projects.service';

@Component({
  selector: 'app-backoffice',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './backoffice.component.html',
  styleUrl: './backoffice.component.css'
})
export class BackofficeComponent implements OnInit{

  router = inject(Router);

  ngOnInit(): void {
    this.getProjects();
  }

  projects: Project[] = [];

  projectsService = inject(ProjectsService);

  getProjects(){
    this.projectsService.getProjects().subscribe({
      next: (result) => {
        if(result.success){
          this.projects = result.data;
        }else{
          console.log(result.data)
        }
      },error: (err) => {
        console.log(err)
      }
    })
  }

  removeProject(id:string){
    if(!id){
      console.log('El proyecto no existe')
    }else{
        this.projectsService.removeProject(id).subscribe({
          next: (result) => {
            if(result.success){
              this.projects = this.projects.filter(project => project._id !== id)
              this.getProjects();
              console.log(result.data)
            }
          }
        })
      }
    }

  newProject(){
    this.router.navigate(['/admin/backoffice/new'])
  }

}
