import { NgStyle } from '@angular/common';
import { Component, Input, inject } from '@angular/core';
import { Router } from '@angular/router';
import { Project } from 'src/app/core/interfaces/Project';

@Component({
  selector: 'app-project-card',
  standalone: true,
  imports: [NgStyle],
  templateUrl: './project-card.component.html',
  styleUrl: './project-card.component.css'
})
export class ProjectCardComponent{
  @Input() project: Project = {title:'',description:'',genre:'',media:[],responsabilities:[], skills:[], links:[], date: '', _id: ''};


  router = inject(Router);

  seeProject(project:Project){
    this.router.navigate([`/portfolio/projects/${project.title}`, { state: { project } }]);
  }

}
