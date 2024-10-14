import { AfterViewInit, Component, ElementRef, OnInit, QueryList, ViewChildren, inject } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { Project } from 'src/app/core/interfaces/Project';
import { ProjectsService } from 'src/app/core/services/projects.service';
import { FooterComponent } from '../footer/footer.component';
import { NavbarComponent } from '../navbar/navbar.component';

@Component({
  selector: 'app-project',
  standalone: true,
  templateUrl: './project.component.html',
  styleUrls: ['./project.component.css'],
  imports: [NavbarComponent,FooterComponent]
})
export class ProjectComponent implements OnInit, AfterViewInit{

  @ViewChildren('visual') images!: QueryList<ElementRef>

  sanitizer = inject(DomSanitizer);

  projectsService = inject(ProjectsService);
  route = inject(ActivatedRoute);
  router = inject(Router);
  project: Project = {
    _id: undefined,
    title: 'OnTime!',
    genre: '',
    description: '',
    media: [],
    responsabilities: [],
    skills: [],
    links: [],
    date: ''
  }
  youtube: SafeResourceUrl = '';
  video: boolean = false;

  ngOnInit(): void {
    window.scrollTo(0,0);
    this.project = history.state.proyecto;
    if (!this.project) {
      let projectName: any;
      this.route.paramMap.subscribe({
        next: (param) => {
          projectName = param.get('project');
          const encodedParam = encodeURIComponent(projectName);
          this.getProject(encodedParam);
        }
      });
    }
  }

  ngAfterViewInit(): void {
    this.images.forEach((image: ElementRef) => {
      const imgElement = image.nativeElement as HTMLImageElement;

      imgElement.onload = () => {
        if(imgElement.naturalWidth > imgElement.naturalHeight){
        
          image.nativeElement.style.aspectRatio = '16/9';
          image.nativeElement.style.gridRow = 'span 1';
        }else{
          image.nativeElement.style.aspectRatio = '9/16';
          image.nativeElement.style.gridRow = 'span 3';
        }
      }
    })

  }

  getProject(projectName: string){
    this.projectsService.getProjectByName(projectName).subscribe({
      next: (result) => {
        if(result.success){
          this.project = result.data
          this.project.description = this.project.description?.replace(/\n/g, "<br>");
          if(this.project.others){
            const url = 'https://www.youtube.com/embed/'+this.project.others[0].split('v=')[this.project.others[0].split('v=').length - 1];
            this.youtube = this.sanitizer.bypassSecurityTrustResourceUrl(url);
            this.video = true;
          }
        }
      }
    })
  }

}
