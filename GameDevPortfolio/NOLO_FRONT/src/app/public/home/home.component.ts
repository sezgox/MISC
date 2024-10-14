import { NgClass, NgStyle } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Project } from '../../core/interfaces/Project';
import { ProjectsService } from '../../core/services/projects.service';
import { FlipCardComponent } from '../flip-card/flip-card.component';
import { FooterComponent } from '../footer/footer.component';
import { NavbarComponent } from '../navbar/navbar.component';
import { ProjectCardComponent } from '../project-card/project-card.component';

@Component({
  selector: 'app-home',
  standalone: true,
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
  imports: [FooterComponent,FlipCardComponent,ProjectCardComponent,NavbarComponent,NgClass, NgStyle, MatProgressSpinnerModule, RouterLink]
})
export class HomeComponent implements OnInit{

  router = inject(Router);
  projectsService = inject(ProjectsService);
  route = inject(ActivatedRoute);

  projects: Project[] = [];

  hasVisited: boolean = false;
  animationDone: boolean = false;
  buttonContent: string = 'S T A R T';
  loading: boolean = true;

  pathImages: string = '../../../assets/';
  pathTools: string = this.pathImages.concat('tools/')

  tools: string[] = ['unity.png','ue.png', 'jira.png', 'c4d.png', 'photo.png', 'ae.png','ai.png', 'off.png'];
  specializations: any[] = [
    {
      text: 'VR/AR',
      image: `${this.pathImages}/about/VR.png`
    },
    {
      text: 'UX/UI Design',
      image: `${this.pathImages}/about/ux.png`
    },
    {
      text: 'System Design',
      image: `${this.pathImages}/about/gd2.png`
    }
  ];
  animationExp: string = 'shutdown 0.7s cubic-bezier(0.755, 0.05, 0.855, 0.06) both, turnUp 1s 0.8s ease-in-out forwards;'

  ngOnInit(): void {
    this.getProjects();
    this.hasVisited = localStorage.getItem('START') == 'DONE' ? true : false;
    this.animationDone =  localStorage.getItem('START') == 'DONE' ? true : false;
    this.changeButtonContent();
  }

  scrollToSection(fragment:any){
    if(fragment){
      const section = document.getElementById(fragment);
      if(section){
        const offsetTop = section.getBoundingClientRect().top + window.scrollY - 100;
        window.scrollTo( {top: offsetTop,
        behavior: 'smooth'});
      }
    }
  }

  start(){
    let time = 0;
    if(!this.hasVisited){
      localStorage.setItem('START','DONE');
      this.hasVisited = true;
      time = 1000;
    }
    setTimeout(() => {
      this.changeButtonContent();
      setTimeout(() => {
        this.scrollToSection('about');
        this.animationDone = true;
      },time + 500)
    },time);
  }

  changeButtonContent(){
    this.buttonContent = this.hasVisited ? '<i class="fa-solid fa-arrow-down"></i>' : 'S T A R T';
  }

  getProjects(){
    this.projectsService.loadProyectos();
    this.projectsService.loading$.subscribe(value => this.loading = value);
    this.projectsService.getAllProjects().subscribe({
      next: (res) => {
        if(res.length > 0){
          this.projects = res;
          setTimeout(() => {
            this.route.fragment.subscribe(fragment => {
              this.scrollToSection(fragment)
            });
          },100)
        }
      },error: (err) => {
        console.log('ERROR: ' + err)
      }
    })

  }
}
